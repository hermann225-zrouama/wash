const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

const pressing = sq.define('pressing', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lat: {
        type: DataTypes.STRING,
        allowNull: false
    },
    long: {
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