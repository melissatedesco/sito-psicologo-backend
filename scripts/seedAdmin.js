import 'dotenv/config'
import sequelize from '../db.js'
import Staff from '../models/Staff.js'

// crea il primo account Dottore, se non esiste già
// si lancia UNA volta
const seedAdmin = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        const email = process.env.DOTTORE_EMAIL
        const username = process.env.DOTTORE_USERNAME
        const password = process.env.DOTTORE_PASSWORD

        if(!email || !username || !password) {
            console.error('Mancano DOTTORE_EMAIL, DOTTORE_USERNAME o DOTTORE_PASSWORD')
            process.exit(1)
        }

        // evita di creare un secondo profilo
        const esistente = await Staff.findOne({
            where: { role: 'dottore'}
        })
        if (esistente) {
            console.log('Dottore già esistente', esistente.username)
            process.exit(0)
        }

        const dottore = await Staff.create({
            email, 
            username,
            password,
            role: 'dottore'
        })
        console.log('Dottore creato:', dottore.username, '-', dottore.email)
        process.exit(0)
    } catch (err) {
        console.error('Errore nel seed:', err.message)
        process.exit(1)
    }
}

seedAdmin()
