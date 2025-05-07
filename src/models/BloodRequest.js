const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BloodRequest = sequelize.define('BloodRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  hospitalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  requestedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'blood_requests'
});

module.exports = BloodRequest; 