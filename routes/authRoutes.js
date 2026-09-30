import express from 'express'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import Staff from '../models/Staff.js'
import { authenticateUser } from '../middleware/authMiddleware.js'

const router = express.Router()

// Chi può creare chi (rispecchia la matrice dei permessi):
// - Admin crea gli account staff (dottore, segretaria)
// - Dottore crea solo segretarie
// - Segretaria non compare → non può creare nessuno
const RUOLI_VALIDI = ['admin', 'dottore', 'segretaria']

const CREABILI_DA = {
    admin: ['dottore', 'segretaria'],
    dottore: ['segretaria']
}

// REGISTRAZIONE — solo staff loggato, con permesso in base al proprio ruolo
router.post('/register', authenticateUser, async (req, res) => {
    try {
        const { email, username, password, role } = req.body ?? {}

        if (!email || !username || !password || !role) {
            return res.status(400).json({ error: 'Email, username, password e ruolo sono obbligatori' })
        }

        if (!RUOLI_VALIDI.includes(role)) {
            return res.status(400).json({ error: 'Ruolo non valido' })
        }

        // Il creatore può creare solo i ruoli consentiti dal suo ruolo
        const consentiti = CREABILI_DA[req.user.role] ?? []

        if (!consentiti.includes(role)) {
            return res.status(403).json({ error: `un ${req.user.role} non può creare un account ${role}` })
        }

        // username o email già in uso?
        const esistente = await Staff.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        })
        if (esistente) {
            return res.status(409).json({ error: 'Email o username già esistente' })
        }

        // Password in chiaro: ci pensa l'hook beforeCreate del modello a hasharla
        const newUser = await Staff.create({ email, username, password, role })

        return res.status(201).json({
            message: 'Account creato con successo.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'Email non valida' })
        }
        console.error('Errore durante la registrazione:', error)
        return res.status(500).json({ error: 'Errore interno del server.' })
    }
})

// login (accetta username o email)
router.post('/login', async (req, res) => {
    try {
        // identifier può essere la mail o lo username
        const { identifier, password } = req.body ?? {}

        if (!identifier || !password) {
            return res.status(400).json({ error: 'Username, email e password sono obbligatori' })
        }

        const user = await Staff.findOne({
            where: { [Op.or]: [{ username: identifier }, { email: identifier }] }
        })

        if (!user) {
            return res.status(401).json({ error: 'Credenziali non valide' })
        }

        // verifica della password
        const isMatch = await user.checkPassword(password)
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenziali non valide' })
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        )

        return res.json({
            message: 'Login effettuato con successo',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error('Errore durante il login', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

export default router
