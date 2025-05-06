const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ... existing fields ...
  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model('User', userSchema); 