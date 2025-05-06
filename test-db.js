const { sequelize } = require('./config/database');
const modelsPromise = require('./models');
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();

async function createUser(models, userData) {
  try {
    // Check if user already exists
    const existingUser = await models.User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      console.log(`Deleting existing user: ${userData.email}`);
      await existingUser.destroy();
    }

    // Create user - password will be hashed by the User model hook
    const user = await models.User.create(userData);
    console.log(`User created: ${user.email}`);

    // Verify password
    const isMatch = await user.comparePassword(userData.password);
    console.log(`Password verification for ${user.email}: ${isMatch}`);

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    // Get Sequelize instance
    const sequelizeInstance = await sequelize;
    
    // Test authentication
    await sequelizeInstance.authenticate();
    console.log('✓ Database connection established successfully');

    // Get models
    const models = await modelsPromise;

    // Drop and recreate tables
    console.log('\nRecreating database tables...');
    await sequelizeInstance.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelizeInstance.sync({ force: true });
    await sequelizeInstance.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✓ Database tables recreated successfully');

    // Create admin user
    console.log('\nCreating admin user...');
    const adminUser = await createUser(models, {
      name: 'Admin User',
      email: 'admin@bloodbank.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✓ Admin user created successfully');
    console.log('Admin Login Credentials:');
    console.log('Email: admin@bloodbank.com');
    console.log('Password: admin123');

    // Create donor (client) user
    console.log('\nCreating donor user...');
    const donorUser = await createUser(models, {
      name: 'John Donor',
      email: 'donor@example.com',
      password: 'donor123',
      role: 'donor',
      bloodGroup: 'O+',
      phone: '1234567890',
      address: '123 Main St'
    });
    console.log('✓ Donor user created successfully');
    console.log('Donor Login Credentials:');
    console.log('Email: donor@example.com');
    console.log('Password: donor123');

    // Create initial blood inventory
    console.log('\nCreating blood inventory...');
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of bloodGroups) {
      await models.BloodInventory.create({
        bloodGroup: group,
        quantity: 10
      });
    }
    console.log('✓ Initial blood inventory created successfully');

    // Verify users can be found and passwords match
    console.log('\nVerifying users...');
    const foundAdmin = await models.User.findOne({ where: { email: 'admin@bloodbank.com' } });
    const foundDonor = await models.User.findOne({ where: { email: 'donor@example.com' } });

    if (foundAdmin) {
      const adminPasswordMatch = await bcrypt.compare('admin123', foundAdmin.password);
      console.log(`Admin password verification: ${adminPasswordMatch}`);
    }

    if (foundDonor) {
      const donorPasswordMatch = await bcrypt.compare('donor123', foundDonor.password);
      console.log(`Donor password verification: ${donorPasswordMatch}`);
    }

    console.log('\nAll setup completed successfully!');
    console.log('\n----------------------------------------');
    console.log('You can now use these credentials to login:');
    console.log('\nAdmin Login:');
    console.log('Email: admin@bloodbank.com');
    console.log('Password: admin123');
    console.log('\nDonor Login:');
    console.log('Email: donor@example.com');
    console.log('Password: donor123');
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('\nError during testing:', error);
    process.exit(1);
  }
}

async function testDatabase() {
  try {
    // Test database connection
    const db = await sequelize;
    await db.authenticate();
    console.log('Database connection successful');

    // Get models
    const models = await modelsPromise;
    console.log('Models loaded successfully');

    // Test BloodDonation model
    try {
      const result = await db.query('SELECT * FROM blood_donations LIMIT 1');
      console.log('Blood donations table exists:', result);
    } catch (err) {
      console.error('Blood donations table error:', err);
    }

    // Test routes
    app.get('/test-donations', async (req, res) => {
      try {
        const donations = await models.BloodDonation.findAll();
        res.json(donations);
      } catch (error) {
        console.error('Test route error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Database test failed:', error);
  }
}

console.log('Starting database setup...\n');
testConnection();
testDatabase(); 