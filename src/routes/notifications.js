const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');

// Get all notifications for a user (userId from query or header for now)
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const models = await modelsPromise;
    const notifications = await models.Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const models = await modelsPromise;
    const notification = await models.Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 