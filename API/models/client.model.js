const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

const client = sq.define('client', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {freezeTableName: true});

client.sync({alter: true});

module.exports = client;
