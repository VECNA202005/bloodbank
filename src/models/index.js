const { Sequelize } = require('sequelize');
const UserModel = require('./User');
const BloodInventoryModel = require('./BloodInventory');
const BloodRequestModel = require('./BloodRequest');
const BloodDonationModel = require('./BloodDonation');
const NotificationModel = require('./Notification');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bloodbank',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root123',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Initialize models
const User = UserModel(sequelize);
const BloodInventory = BloodInventoryModel(sequelize);
const BloodRequest = BloodRequestModel(sequelize);
const BloodDonation = BloodDonationModel(sequelize);
const Notification = NotificationModel(sequelize);

// Define relationships
User.hasMany(BloodRequest, { foreignKey: 'requestedBy' });
BloodRequest.belongsTo(User, { foreignKey: 'requestedBy' });

User.hasMany(BloodDonation, { foreignKey: 'donorId' });
BloodDonation.belongsTo(User, { foreignKey: 'donorId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Sync all models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  BloodInventory,
  BloodRequest,
  BloodDonation,
  Notification,
  syncDatabase
}; 