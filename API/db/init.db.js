require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME || 'WASH_DB', process.env.DB_USER || 'admin', process.env.DB_PASSWORD || 'admin',
{
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.SGBD || 'postgres'
});

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {sq: sequelize, initDatabase: testDbConnection};