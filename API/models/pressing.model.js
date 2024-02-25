const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

const pressing = sq.define('pressing', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5
    },
    authorized: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, { freezeTableName: true });

pressing.sync({ alter: true });

module.exports = pressing;