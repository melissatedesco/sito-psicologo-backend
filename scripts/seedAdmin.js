import 'dotenv/config'
import sequelize from '../db.js'
import Staff from '../models/Staff.js'

// crea il primo account Admin, se non esiste già
// si lancia UNA volta
const seedAdmin = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        const email = process.env.ADMIN_EMAIL
        const username = process.env.ADMIN_USERNAME
        const password = process.env.ADMIN_PASSWORD

        if(!email || !username || !password) {
            console.error('Mancano ADMIN_EMAIL, ADMIN_USERNAME o ADMIN_PASSWORD')
            process.exit(1)
        }

        // evita di creare un secondo profilo
        const esistente = await Staff.findOne({
            where: { role: 'admin'}
        })
        if (esistente) {
            console.log('Admin già esistente', esistente.username)
            process.exit(0)
        }

        const admin = await Staff.create({
            email, 
            username,
            password,
            role: 'admin'
        })
        console.log('Admin creato:', admin.username, '-', admin.email)
        process.exit(0)
    } catch (err) {
        console.error('Errore nel seed:', err.message)
        process.exit(1)
    }
}

seedAdmin()
