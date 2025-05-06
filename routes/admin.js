const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Admin summary endpoint
router.get('/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const models = await modelsPromise;
    // Inventory summary
    const inventory = await models.BloodInventory.findAll();
    // Donor count
    const donorCount = await models.User.count({ where: { role: 'donor' } });
    // Request stats
    const totalRequests = await models.BloodRequest.count();
    const pendingRequests = await models.BloodRequest.count({ where: { status: 'pending' } });
    const approvedRequests = await models.BloodRequest.count({ where: { status: 'approved' } });
    const rejectedRequests = await models.BloodRequest.count({ where: { status: 'rejected' } });
    const completedRequests = await models.BloodRequest.count({ where: { status: 'completed' } });

    res.json({
      inventory,
      donorCount,
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        completed: completedRequests
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recent blood requests
router.get('/activity/requests', authenticateToken, isAdmin, async (req, res) => {
  try {
    const models = await modelsPromise;
    const requests = await models.BloodRequest.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{ model: models.User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recent inventory updates
router.get('/activity/inventory', authenticateToken, isAdmin, async (req, res) => {
  try {
    const models = await modelsPromise;
    console.log('Fetching inventory data...');
    
    const inventory = await models.BloodInventory.findAll({
      order: [['updatedAt', 'DESC']],
      limit: 20
    });
    
    console.log('Inventory data fetched successfully:', inventory);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ 
      message: 'Failed to load inventory data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Recent donor registrations
router.get('/activity/donors', authenticateToken, isAdmin, async (req, res) => {
  try {
    const models = await modelsPromise;
    const donors = await models.User.findAll({
      where: { role: 'donor' },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 