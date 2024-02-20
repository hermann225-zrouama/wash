// create washClovesRequest model
const {DataTypes} = require('sequelize');
const {sq} = require('../db/init.db');

const washClothesRequest = sq.define('washClothesRequest', {
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    delivery_date: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: "00:00:00"
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    pressingId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rating: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 5
    },
    washClothesRequestItems: {
        type: DataTypes.JSON,
        allowNull: false
    },

}, {freezeTableName: true});

washClothesRequest.sync({alter: true});

module.exports = washClothesRequest;