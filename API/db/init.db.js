require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
{
  host: process.env.DB_HOST,
  dialect: process.env.SGBD,
  port: process.env.DB_PORT
});

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    console.log("HOST: ", process.env.DB_HOST)
    console.log("PORT:", process.env.DB_PORT)
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {sq: sequelize, initDatabase: testDbConnection};