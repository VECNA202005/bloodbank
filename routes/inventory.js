const express = require('express');
const router = express.Router();
const modelsPromise = require('../models');

// Get all blood inventory
router.get('/', async (req, res) => {
  try {
    const models = await modelsPromise;
    const inventory = await models.BloodInventory.findAll();
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific blood group inventory
router.get('/:bloodGroup', async (req, res) => {
  try {
    const models = await modelsPromise;
    const { bloodGroup } = req.params;
    const inventory = await models.BloodInventory.findOne({
      where: { bloodGroup }
    });
    
    if (!inventory) {
      return res.status(404).json({ message: 'Blood group not found in inventory' });
    }
    
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update blood inventory
router.put('/:bloodGroup', async (req, res) => {
  try {
    const { quantity } = req.body;
    const bloodGroup = req.params.bloodGroup;
    const models = await modelsPromise;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    if (quantity > 100) {
      return res.status(400).json({ message: 'Inventory quantity cannot exceed 100 units' });
    }

    const [inventory, created] = await models.BloodInventory.findOrCreate({
      where: { bloodGroup },
      defaults: { quantity }
    });

    if (!created) {
      inventory.quantity = quantity;
      await inventory.save();
    }

    console.log('Inventory updated:', {
      bloodGroup,
      newQuantity: quantity
    });

    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset inventory for a specific blood group
router.post('/reset/:bloodGroup', async (req, res) => {
  try {
    const models = await modelsPromise;
    const { bloodGroup } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        message: 'Valid quantity is required'
      });
    }

    if (quantity > 100) {
      return res.status(400).json({
        message: 'Inventory quantity cannot exceed 100 units'
      });
    }

    const [inventory, created] = await models.BloodInventory.findOrCreate({
      where: { bloodGroup },
      defaults: { quantity: 0 }
    });

    await inventory.update({ quantity });
    
    console.log('Inventory reset:', {
      bloodGroup,
      newQuantity: quantity
    });

    res.json({
      message: 'Inventory reset successfully',
      inventory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset all inventory
router.post('/reset-all', async (req, res) => {
  try {
    const models = await modelsPromise;
    const { defaultQuantity = 0 } = req.body;

    if (defaultQuantity < 0 || defaultQuantity > 100) {
      return res.status(400).json({
        message: 'Default quantity must be between 0 and 100'
      });
    }

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (const bloodGroup of bloodGroups) {
      const [inventory] = await models.BloodInventory.findOrCreate({
        where: { bloodGroup },
        defaults: { quantity: defaultQuantity }
      });
      
      await inventory.update({ quantity: defaultQuantity });
    }

    console.log('All inventory reset to:', defaultQuantity);

    res.json({
      message: 'All inventory reset successfully',
      defaultQuantity
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 