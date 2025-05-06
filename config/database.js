const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

let sequelizeInstance = null;

async function initialize() {
  if (sequelizeInstance) return sequelizeInstance;

  try {
    console.log('Initializing database connection...');
    
    // Create the database if it doesn't exist
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root123'
    });

    console.log('Creating database if not exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS bloodbank;');
    await connection.end();
    console.log('Database created/verified successfully');

    // Create Sequelize instance
    sequelizeInstance = new Sequelize('bloodbank', 'root', 'root123', {
      host: 'localhost',
      dialect: 'mysql',
      logging: console.log, // Enable logging
      define: {
        timestamps: true,
        underscored: true
      },
      dialectOptions: {
        dateStrings: true,
        typeCast: true
      }
    });

    // Test the connection
    await sequelizeInstance.authenticate();
    console.log('Database connection has been established successfully.');

    return sequelizeInstance;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Initialize the database connection
const sequelize = initialize();

module.exports = { sequelize }; 