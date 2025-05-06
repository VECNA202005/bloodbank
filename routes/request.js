const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');
const { sendMail } = require('../utils/mailer');

// Create blood request
router.post('/', async (req, res) => {
  try {
    const models = await modelsPromise;
    const request = await models.BloodRequest.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all blood requests
router.get('/', async (req, res) => {
  try {
    const models = await modelsPromise;
    const requests = await models.BloodRequest.findAll({
      include: [{
        model: models.User,
        attributes: ['name', 'email']
      }]
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const models = await modelsPromise;
    const request = await models.BloodRequest.findByPk(req.params.id, {
      attributes: ['id', 'bloodGroup', 'quantity', 'requestedBy', 'status'],
      include: [{
        model: models.User,
        attributes: ['email']
      }]
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    await request.save();

    // Update blood inventory if approved or completed
    if (status === 'approved' || status === 'completed') {
      console.log('Request bloodGroup:', request.bloodGroup);
      console.log('Request quantity:', request.quantity);
      const inventory = await models.BloodInventory.findOne({
        where: { bloodGroup: request.bloodGroup }
      });
      if (inventory) {
        console.log('Current inventory before update:', inventory.quantity);
        if (parseInt(request.quantity) > inventory.quantity) {
          return res.status(400).json({ message: `Not enough blood in inventory for ${request.bloodGroup}. Available: ${inventory.quantity}, Requested: ${request.quantity}` });
        }
        inventory.quantity = Math.max(0, inventory.quantity - parseInt(request.quantity));
        await inventory.save();
        console.log('Inventory after update:', inventory.quantity);
      } else {
        console.warn(`No inventory record found for blood group: ${request.bloodGroup}`);
        return res.status(400).json({ message: `No inventory record found for blood group: ${request.bloodGroup}` });
      }
    }

    // Create notification
    if (["approved", "rejected", "completed"].includes(status)) {
      let message = '';
      if (status === 'approved') message = 'Your blood request has been approved.';
      if (status === 'rejected') message = 'Your blood request has been rejected.';
      if (status === 'completed') message = 'Your blood request has been completed.';

      await models.Notification.create({
        userId: request.requestedBy,
        type: 'request_status',
        message,
        read: false
      });

      // Send email notification
      if (status === 'approved' || status === 'rejected') {
        if (request.User && request.User.email) {
          const emailSent = await sendMail(
            request.User.email,
            status === 'approved' ? 'requestApproved' : 'requestRejected',
            request
          );

          if (!emailSent) {
            console.warn('Failed to send email notification');
          }
        }
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all requests for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const models = await modelsPromise;
    const requests = await models.BloodRequest.findAll({
      where: { requestedBy: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a blood request by ID
router.delete('/:id', async (req, res) => {
  try {
    const models = await modelsPromise;
    const request = await models.BloodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    await request.destroy();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 