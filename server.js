import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './db.js'
import authRoutes from './routes/authRoutes.js'
import appuntamentoRoutes from './routes/appuntamentoRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// middleware
// nota: con credentials: true il browser non accetta origin '*', quindi senza CLIENT_URL si riflette l'origine della richiesta
app.use(cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true
}))
app.use(express.json())

// rotte API
app.use('/api/auth', authRoutes)
app.use('/api/appuntamento', appuntamentoRoutes)

// rotta di controllo
app.get('/', (req, res) => {
    res.json({ message: 'API Studio Psicologia attiva e funzionante' })
})

// sincronizzazione DataBase e avvio server
const startServer = async () => {
    try {
        await sequelize.authenticate()
        console.log('Connessione al database MySql di MAMP riuscita')

        await sequelize.sync()
        console.log('Tabelle del database sincronizzate con successo')

        app.listen(PORT, () => {
            console.log(`Server Node.js avviato sulla porta ${PORT}`)
        })
    } catch (error) {
        console.error('Impossibile connettersi al database di MAMP:', error)
        process.exit(1)
    }
}

startServer()
