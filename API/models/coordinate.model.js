const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

const coordinate = sq.define('coordinate',
{
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lat:{
        type: DataTypes.FLOAT,
        allowNull: true,
        default: 1
    },
    long:{
        type: DataTypes.FLOAT,
        allowNull: true,
        default: -1
    },
    category:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{ freezeTableName: true })

coordinate.sync({alter: true})

module.exports = coordinate