import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

const router = express.Router()

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
