const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

// Create blood request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const models = await modelsPromise;
    const { patientName, bloodGroup, quantity, hospitalName } = req.body;

    // Validate required fields
    if (!patientName || !bloodGroup || !quantity || !hospitalName) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['patientName', 'bloodGroup', 'quantity', 'hospitalName']
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ 
        message: 'Invalid blood group',
        validGroups: validBloodGroups
      });
    }

    // Create request
    const request = await models.BloodRequest.create({
      patientName,
      bloodGroup,
      quantity: Number(quantity),
      hospitalName,
      requestedBy: req.user.id
    });

    // Create notification for admin
    await models.Notification.create({
      userId: req.user.id,
      type: 'new_request',
      message: `New blood request for ${patientName} (${bloodGroup})`,
      read: false
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ 
      message: 'Failed to create request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all blood requests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const models = await modelsPromise;
    const requests = await models.BloodRequest.findAll({
      include: [{
        model: models.User,
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Get user's requests
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const models = await modelsPromise;
    const requests = await models.BloodRequest.findAll({
      where: { requestedBy: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Failed to fetch user requests' });
  }
});

// Update request status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const models = await modelsPromise;
    const request = await models.BloodRequest.findByPk(req.params.id, {
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
    await models.Notification.create({
      userId: request.requestedBy,
      type: 'request_status',
      message: `Your blood request has been ${status}`,
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

    res.json(request);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Failed to update request' });
  }
});

// Delete request
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const models = await modelsPromise;
    const request = await models.BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only allow deletion if user is admin or request owner
    if (req.user.role !== 'admin' && request.requestedBy !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await request.destroy();
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Failed to delete request' });
  }
});

module.exports = router; 