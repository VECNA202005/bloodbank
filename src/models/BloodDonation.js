const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BloodDonation = sequelize.define('BloodDonation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  donationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'blood_donations'
});

module.exports = BloodDonation; 