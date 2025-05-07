const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');

// Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const models = await modelsPromise;
    const notifications = await models.Notification.findAll({
      where: { userId: req.params.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const models = await modelsPromise;
    const notification = await models.Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Failed to update notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const models = await modelsPromise;
    const notification = await models.Notification.findByPk(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      message: 'Failed to delete notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 