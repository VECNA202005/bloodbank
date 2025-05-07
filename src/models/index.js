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
    console.log('Attempting to connect to database...');
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Force sync to recreate tables (only in development)
    const forceSync = process.env.NODE_ENV === 'development';
    await sequelize.sync({ force: forceSync });
    console.log('Database synchronized successfully.');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@bloodbank.com',
        password: 'admin123', // This will be hashed by the model
        role: 'admin',
        bloodGroup: 'O+',
        phone: '1234567890',
        address: 'Admin Address'
      });
      console.log('Admin user created successfully');
    }

    // Initialize blood inventory if empty
    const inventoryExists = await BloodInventory.findOne();
    if (!inventoryExists) {
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const group of bloodGroups) {
        await BloodInventory.create({
          bloodGroup: group,
          quantity: 0
        });
      }
      console.log('Blood inventory initialized');
    }

  } catch (error) {
    console.error('Database initialization error:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
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