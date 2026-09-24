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
        defaultValue: 'confermato'
    }
}, {
    tableName:'appuntamento',
    indexes: [
        {
            unique: true,
            fields: ['date', 'startTime'],
            name: 'unique_appuntamento_slot'
        }
    ]
})

export default Appuntamento