import { Sequelize } from "sequelize"
import dotenv from 'dotenv'
dotenv.config({ override: true, quiet: true })

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions: process.env.DB_SSL === 'true'
            ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
            : {},
    }
)

export default sequelize