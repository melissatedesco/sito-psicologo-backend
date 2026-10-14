import express from 'express'
import { sendContactEmail } from '../utils/sendEmail.js'

const router = express.Router()

// POST /api/contact invia il messaggio del visitarore allo studio
router.post('/contact', async (req, res) => {
    try {
        const {name, email, message} = req.body ?? {}

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Tutti i campi sono obbligarori'})
        }

        await sendContactEmail({name, email, message})
        return res.status(200).json({message: 'Messaggio inviato con successo'})
    } catch (error) {
        console.error('Errore invio messaggio contatti:', error)
        return res.status(500).json({ error: 'Errore durante l\'invio del messaggio'})
    }
})

export default router