const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

// TODO: create phone number veirfication:
// creation de model pour la localisation


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
    lat: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
    },
    long: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
    }
}, {freezeTableName: true});

client.sync({alter: true});

module.exports = client;
