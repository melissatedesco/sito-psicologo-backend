import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Appuntamento = sequelize.define('Appuntamento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    startTime: {
     type: DataTypes.STRING(5),
     allowNull: false   
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    clientPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull:true
    },
    status: {
        type: DataTypes.ENUM('confermato', 'cancellato'),
        allowNull: false,
        defaultValue: 'confermato'
    }
}, {
    manageToken: {
        type: DataTypes.UUID, // UUID: Universally Unique Identifier, è un'Id univoco con stringa casuali di 36 lettere. il manageToken è legata alla sicurezza e privacy
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    }
}, {
    tableName:'Appuntamento',
    indexes: [
        {
            name: 'unique_appuntamento_slot',
            unique: true,
            fields: ['date', 'startTime'],
        }
    ]
})

export default Appuntamento