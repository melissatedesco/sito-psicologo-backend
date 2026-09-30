import express from 'express'
import { Op } from 'sequelize'
import { sendConfirmationEmail } from '../utils/sendEmail.js'
import Appuntamento from '../models/Appuntamento.js'
import { calculateAvailableSlots, isValidDateString } from '../utils/slotCalculator.js'
import { authenticateUser, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// campi che lo staff può modificare
const CAMPI_MODIFICABILI = ['date', 'startTime', 'clientName', 'clientEmail', 'clientPhone', 'notes', 'status']

// rotte del paziente

// calcola e restituisce i posti liberi per una data
router.get('/available-slots', async (req, res) => {
    try {
        const { date } = req.query
        if (!isValidDateString(date)) {
            return res.status(400).json({ error: 'La data è obbligatoria (formato YYYY-MM-DD)' })
        }

        const bookedAppuntamenti = await Appuntamento.findAll({
            where: { date, status: 'confermato' },
            attributes: ['startTime']
        })

        const availableSlots = calculateAvailableSlots(date, bookedAppuntamenti)
        return res.json({ date, availableSlots })
    } catch (error) {
        console.error('Errore nel recupero slot:', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

// registra un nuovo appuntamento e invia l'email
router.post('/book', async (req, res) => {
    try {
        const { date, startTime, clientName, clientEmail, clientPhone, notes } = req.body ?? {}

        if (!date || !startTime || !clientName || !clientEmail || !clientPhone) {
            return res.status(400).json({ error: 'Tutti i campi devono essere compilati' })
        }

        if (!isValidDateString(date)) {
            return res.status(400).json({ error: 'Formato data non valido (YYYY-MM-DD)' })
        }

        const oggi = new Date().toISOString().slice(0, 10)
        if (date < oggi) {
            return res.status(400).json({ error: 'Non è possibile prenotare in una data passata' })
        }

        const existing = await Appuntamento.findOne({ where: { date, startTime } })

        if (existing && existing.status === 'confermato') {
            return res.status(409).json({ error: 'Spiacenti, questo orario è già stato prenotato' })
        }

        // l'orario deve essere uno degli slot previsti (giorno lavorativo e fascia oraria valida)
        if (!calculateAvailableSlots(date).includes(startTime)) {
            return res.status(400).json({ error: 'Orario non disponibile per la data selezionata' })
        }

        // un appuntamento cancellato occupa ancora lo slot per il vincolo unique: lo si rimuove
        if (existing) {
            await existing.destroy()
        }

        const newAppuntamento = await Appuntamento.create({
            date,
            startTime,
            clientName,
            clientEmail,
            clientPhone,
            notes
        })

        sendConfirmationEmail(newAppuntamento).catch(err =>
            console.error('Errore invio email:', err)
        )

        return res.status(201).json({
            message: 'Prenotazione avvenuta con successo',
            appuntamento: newAppuntamento
        })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Spiacenti, questo orario è già stato prenotato' })
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Dati non validi', details: error.errors.map(e => e.message) })
        }
        console.error('Errore prenotazione:', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

// GET /manage/:token  → il paziente vede il proprio appuntamento
router.get('/manage/:token', async (req, res) => {
  try {
    const { token } = req.params

    const appuntamento = await Appuntamento.findOne({
      where: { manageToken: token },
    })

    if (!appuntamento) {
      return res.status(404).json({ error: 'Appuntamento non trovato o link non valido' })
    }

    // Restituisco solo i campi utili al paziente, non tutto il record
    return res.json({
      date: appuntamento.date,
      startTime: appuntamento.startTime,
      clientName: appuntamento.clientName,
      status: appuntamento.status,
    })
  } catch (error) {
    console.error('Errore recupero appuntamento:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
})

// DELETE /manage/:token  → il paziente disdice il proprio appuntamento
router.delete('/manage/:token', async (req, res) => {
  try {
    const { token } = req.params

    const appuntamento = await Appuntamento.findOne({
      where: { manageToken: token },
    })

    if (!appuntamento) {
      return res.status(404).json({ error: 'Appuntamento non trovato o link non valido' })
    }

    await appuntamento.destroy()
    return res.json({ message: 'Appuntamento disdetto correttamente' })
  } catch (error) {
    console.error('Errore disdetta:', error)
    return res.status(500).json({ error: 'Errore interno del server' })
  }
})

// rotte protette per lo staff (dottore e segretaria)

// elenco completo degli appuntamenti
router.get('/', authenticateUser, requireRole('dottore', 'segretaria'), async (req, res) => {
    try {
        const appuntamenti = await Appuntamento.findAll({
            order: [['date', 'DESC'], ['startTime', 'ASC']]
        })
        return res.json(appuntamenti)
    } catch (error) {
        console.error('Errore recupero appuntamenti:', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

// modifica appuntamento
router.put('/:id', authenticateUser, requireRole('dottore', 'segretaria'), async (req, res) => {
    try {
        const { id } = req.params
        const appuntamento = await Appuntamento.findByPk(id)

        if (!appuntamento) {
            return res.status(404).json({ error: 'Appuntamento non trovato' })
        }

        if (req.body?.date !== undefined && !isValidDateString(req.body.date)) {
            return res.status(400).json({ error: 'Formato data non valido (YYYY-MM-DD)' })
        }

        await appuntamento.update(req.body ?? {}, { fields: CAMPI_MODIFICABILI })
        return res.json({ message: 'Appuntamento aggiornato con successo', appuntamento })
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Esiste già un appuntamento in questo orario' })
        }
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError') {
            return res.status(400).json({ error: 'Dati non validi' })
        }
        console.error('Errore aggiornamento:', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

// elimina appuntamento
router.delete('/:id', authenticateUser, requireRole('dottore', 'segretaria'), async (req, res) => {
    try {
        const { id } = req.params
        const appuntamento = await Appuntamento.findByPk(id)

        if (!appuntamento) {
            return res.status(404).json({ error: 'Appuntamento non trovato' })
        }

        await appuntamento.destroy()
        return res.json({ message: 'Appuntamento eliminato con successo' })
    } catch (error) {
        console.error('Errore eliminazione:', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

export default router
