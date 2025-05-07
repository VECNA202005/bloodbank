const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BloodRequest = sequelize.define('BloodRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']]
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    hospitalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
      defaultValue: 'pending'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return BloodRequest;
}; 