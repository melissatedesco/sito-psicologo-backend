import jwt from 'jsonwebtoken'

export const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accesso negato: token mancante o non valido' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.admin = decoded
        next()
    } catch (error) {
        return res.status(403).json({ error: 'Token non valido o scaduto' })
    }
}
