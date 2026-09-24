import bcrypt from 'bcrypt'
import sequelize from '../db.js'
import Admin from '../models/Admin.js'

// credenziali lette dal file .env (con valori di default solo per lo sviluppo)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!'

const seedAdmin = async () => {
    try {
        await sequelize.sync()

        const existingAdmin = await Admin.findOne({ where: { username: ADMIN_USERNAME } })
        if (existingAdmin) {
            console.log('L\'utente Admin è già stato creato in precedenza')
            process.exit(0)
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

        await Admin.create({
            username: ADMIN_USERNAME,
            password: hashedPassword
        })

        console.log(`Utente Admin creato con successo! (Username: ${ADMIN_USERNAME})`)
        process.exit(0)
    } catch (error) {
        console.error('Errore durante la creazione dell\'Admin:', error)
        process.exit(1)
    }
}

seedAdmin()
