const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BloodInventory = sequelize.define('BloodInventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'blood_inventory'
});

module.exports = BloodInventory; 