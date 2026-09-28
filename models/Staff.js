import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt'
import{ sequelize} from "../db.js";

const Staff = sequelize.define('Staff', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'dottore', 'segretaria'),
        allowNull: false,
    }
}, {
    tableName: 'staff',
    hooks: {
        beforeCreate: async (staff) => {
            staff.password = await bcrypt.hash(staff.password, 10)
        },
        beforeUpdate: async (staff) => {
            if (staff.changed('password')) {
                staff.password = await bcrypt.hash(staff.password, 10)
            }
        }
    }
})

Staff.prototype.checkPassword = function (plain) {
    return bcrypt.compare(plain, this.password)
}

export default Staff