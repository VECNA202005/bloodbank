const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const modelsPromise = require('../models');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Debug middleware for auth routes
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  next();
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, phone, address } = req.body;
    console.log('Registration attempt for:', email);

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Get models
    const models = await modelsPromise;

    // Check if user exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await models.User.create({
      name,
      email,
      password, // Password will be hashed by model hook
      role: role || 'donor',
      bloodGroup,
      phone,
      address
    });
    console.log('User created successfully:', email);

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get models
    const models = await modelsPromise;

    // Find user by email
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log('User found:', user.email);

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log('No user in request:', req.user);
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('Getting user data for:', req.user.id);
    const models = await modelsPromise;
    const user = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('User not found in database:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.id);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bloodGroup: user.bloodGroup,
      phone: user.phone,
      address: user.address
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  console.log('Forgot password request received');
  try {
    const { email } = req.body;
    console.log('Forgot password request for:', email);
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const models = await modelsPromise;
    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(404).json({ message: 'No user found with this email address' });
    }

    console.log('User found, generating reset token');

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    console.log('Reset token saved for user');

    // Send email with reset link
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    console.log('Sending reset email to:', email);
    
    try {
      const emailSent = await sendMail(email, 'passwordReset', { resetUrl });
      if (!emailSent) {
        throw new Error('Email sending failed');
      }
      console.log('Reset email sent successfully');
      // Return the preview URL in development
      const previewUrl = process.env.NODE_ENV === 'development' ? 
        'Check the server console for the email preview URL' : undefined;
      res.json({ 
        message: 'Password reset instructions sent to your email',
        previewUrl
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Don't return error to user, just log it
      res.json({ 
        message: 'Password reset instructions sent to your email',
        previewUrl: 'Check the server console for the email preview URL'
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Error processing password reset request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const models = await modelsPromise;
    // Find user with valid reset token
    const user = await models.User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Assign new password directly, let model hook hash it
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendMail(user.email, 'passwordResetConfirmation', {});
      console.log('Password reset confirmation email sent');
    } catch (emailError) {
      console.error('Failed to send password reset confirmation email:', emailError);
    }

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router; 