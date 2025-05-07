const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');
const { sendMail } = require('../utils/mailer');
const { authenticateToken } = require('../middleware/auth');

// Get all donors
router.get('/', async (req, res) => {
  try {
    const models = await modelsPromise;
    const donors = await models.User.findAll({ where: { role: 'donor' } });
    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donor by ID
router.get('/:id', async (req, res) => {
  try {
    const models = await modelsPromise;
    const donor = await models.User.findByPk(req.params.id);
    if (!donor || donor.role !== 'donor') {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json(donor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donor info
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const models = await modelsPromise;
    
    // Debug request data
    console.log('Update request:', {
      userId: req.user.id,
      targetId: req.params.id,
      updateData: req.body
    });

    const donor = await models.User.findByPk(req.params.id);
    
    if (!donor) {
      console.log('Donor not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is updating their own profile or is an admin
    if (req.user.id !== donor.id && req.user.role !== 'admin') {
      console.log('Unauthorized update attempt:', {
        userId: req.user.id,
        donorId: donor.id,
        userRole: req.user.role
      });
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // If password is being updated, hash it
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Remove any fields that shouldn't be updated
    const allowedFields = ['name', 'bloodGroup', 'phone', 'address', 'password'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updateData[field] = req.body[field];
      }
    });

    console.log('Filtered update data:', updateData);

    // Update the donor
    await donor.update(updateData);
    
    // Fetch the updated donor to return complete data
    const freshDonor = await models.User.findByPk(donor.id, {
      attributes: { exclude: ['password'] }
    });
    
    console.log('Profile updated successfully:', freshDonor.id);
    
    res.json(freshDonor);
  } catch (error) {
    console.error('Error updating donor profile:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Record blood donation
router.post('/:id/donate', authenticateToken, async (req, res) => {
  try {
    const { bloodGroup, quantity } = req.body;
    const models = await modelsPromise;

    // Validate input
    if (!bloodGroup || !quantity) {
      return res.status(400).json({ message: 'Blood group and quantity are required' });
    }

    // Get donor with email
    const donor = await models.User.findByPk(req.params.id, {
      attributes: ['id', 'email']
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Verify the authenticated user is the donor
    if (req.user.id !== donor.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to record this donation' });
    }

    // Create or update blood inventory
    const [inventory, created] = await models.BloodInventory.findOrCreate({
      where: { bloodGroup },
      defaults: { quantity: 0 }
    });

    // Update inventory quantity
    const newQuantity = inventory.quantity + parseInt(quantity);
    if (newQuantity > 100) {
      return res.status(400).json({ message: 'Inventory quantity cannot exceed 100 units' });
    }

    inventory.quantity = newQuantity;
    await inventory.save();

    // Record donation
    const donation = await models.BloodDonation.create({
      donorId: donor.id,
      bloodGroup,
      quantity,
      date: new Date()
    });

    // Send email notification
    if (donor.email) {
      const emailSent = await sendMail(
        donor.email,
        'donationRecorded',
        { donation, donor }
      );

      if (!emailSent) {
        console.warn('Failed to send donation confirmation email');
      }
    }

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation,
      inventory
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({ 
      message: 'Failed to record donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get donation history
router.get('/:id/donations', async (req, res) => {
  try {
    const models = await modelsPromise;
    const donations = await models.BloodDonation.findAll({
      where: { donorId: req.params.id },
      order: [['date', 'DESC']]
    });
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ 
      message: 'Failed to fetch donations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 