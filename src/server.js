require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const requestRoutes = require('./routes/request');
const donorRoutes = require('./routes/donor');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notification');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bloodbank-ruddy.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Blood Bank Management System API',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      requests: '/api/requests',
      donor: '/api/donor',
      admin: '/api/admin',
      notifications: '/api/notifications'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});
    
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Available routes:');
      console.log('- GET /');
      console.log('- POST /api/auth/register');
      console.log('- POST /api/auth/login');
      console.log('- POST /api/auth/forgot-password');
      console.log('- POST /api/auth/reset-password');
      console.log('- GET /api/inventory');
      console.log('- PUT /api/inventory/:bloodGroup');
      console.log('- POST /api/requests');
      console.log('- PUT /api/requests/:id/status');
      console.log('- POST /api/donor/:id/donate');
      console.log('- GET /api/donor/:id/donations');
      console.log('- GET /api/test');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 