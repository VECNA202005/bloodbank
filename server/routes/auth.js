const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendMail } = require('../../utils/mailer');
const crypto = require('crypto');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

// Forgot Password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request for:', email);
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
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

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router; 