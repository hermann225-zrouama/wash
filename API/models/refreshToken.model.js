const { DataTypes } = require('sequelize');
const { sq } = require('../db/init.db');

const RefreshToken = sq.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID, // Assuming your user IDs are UUIDs
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, { freezeTableName: true });

RefreshToken.sync({alter: true})

module.exports = RefreshToken;
