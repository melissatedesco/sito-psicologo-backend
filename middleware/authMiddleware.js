import jwt from 'jsonwebtoken'

// verifica che la richiesta abbia un token valido
// se è ok, mette i dati dell'utente su req.user e prosegue
export const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization

    // il token arriva nell'header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accesso negato: token mancante o non valido' })
    }

    const token = authHeader.split(' ')[1]

    try {
        // se il token è valido restituisce il payload che avevano firmato
        // nel login: {id, username, email, role}
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next()
    } catch (error) {
        // token scaduto o manomesso
        return res.status(403).json({ error: 'Token non valido o scaduto' })
    }
}

// consente il passaggio solo ad alcuni ruoli
// uso: requireRole('admin') oppure requireRole('dottore', 'segretaria')
export const requireRole = (...ruoliAmmessi) => {
    return (req, res, next) => {
        // va usato sempre dopo authenticateUser, che popola req.user
        if (!req.user) {
            return res.status(401).json({ error: 'Non autenticato' })
        }
        if (!ruoliAmmessi.includes(req.user.role)) {
            return res.status(403).json({ error: 'Non hai i permessi per questa azione' })
        }

        next()
    }
}
