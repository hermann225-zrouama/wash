const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

// TODO: create phone number veirfication:
// creation de model pour la localisation


const customer = sq.define('customer', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {freezeTableName: true});

customer.sync({alter: true});

module.exports = customer;
