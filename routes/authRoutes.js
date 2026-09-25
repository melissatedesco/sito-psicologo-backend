import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import { authenticateAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// rotta per registrare nuovo Admin (solo admin autenticati)
router.post('/register', authenticateAdmin, async (req, res) => {
    try {
        const {username, password} = req.body

        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password sono obbligatori'})
        }

        const existingAdmin =await Admin.findOne({ where: {username}})
        if (existingAdmin) {
            return res.status(409).json({ error: 'Username già esistente'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({
        username,
        password: hashedPassword
    });

        return res.status(201).json({
        message: 'Admin creato con successo.',
        admin: { id: newAdmin.id, username: newAdmin.username }
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    return res.status(500).json({ error: 'Errore interno del server.' });
  }
});

// login admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body ?? {}

        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password sono obbligatori' })
        }

        const admin = await Admin.findOne({ where: { username } })
        if (!admin) {
            return res.status(401).json({ error: 'Credenziali non valide' })
        }

        // verifica della password
        const passwordValida = await bcrypt.compare(password, admin.password)
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenziali non valide' })
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        )

        return res.json({ message: 'Login effettuato con successo', token })
    } catch (error) {
        console.error('Errore durante il login', error)
        return res.status(500).json({ error: 'Errore interno del server' })
    }
})

export default router
