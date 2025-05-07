const sequelize = require('../config/database');
const User = require('./User');
const BloodInventory = require('./BloodInventory');
const BloodRequest = require('./BloodRequest');
const BloodDonation = require('./BloodDonation');
const Notification = require('./Notification');

// Define associations
User.hasMany(BloodDonation);
BloodDonation.belongsTo(User);

User.hasMany(BloodRequest);
BloodRequest.belongsTo(User);

// Initialize database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  BloodInventory,
  BloodRequest,
  BloodDonation,
  Notification
}; 