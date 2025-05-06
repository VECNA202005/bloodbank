const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BloodDonation = sequelize.define('BloodDonation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    donorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
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
        min: 1,
        max: 2
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    tableName: 'blood_donations',
    underscored: true
  });

  return BloodDonation;
}; 