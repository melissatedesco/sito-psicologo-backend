import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sequelize from './db.js'
import './models/Staff.js'
import '/models/Appuntamento'
import authRoutes from './routes/authRoutes.js'
import appuntamentoRoutes from './routes/appuntamentoRoutes.js'

const app = express()

// middleware
// nota: con credentials: true il browser non accetta origin '*', quindi senza CLIENT_URL si riflette l'origine della richiesta
app.use(cors())
// legge i body JSON e li mette su req.body
app.use(express.json())

//helth check: utile per verificare al volo che il server rispone
app.get('/api/health', (req, res) => res.json({ok: true})) 

// rotte API
// /api/auth/register, /api/auth/login
app.use('/api/auth', authRoutes)
// /api/slots/, /api/appuntamento
app.use('/api', appuntamentoRoutes)


// sincronizzazione DataBase e avvio server
const start = async () => {
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

start()
