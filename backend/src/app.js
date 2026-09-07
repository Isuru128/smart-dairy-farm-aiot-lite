const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: corsOrigin && corsOrigin !== '*'
    ? corsOrigin.split(',').map((o) => o.trim())
    : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DairyFarm AIoT Backend API is running',
    health: '/health',
    api: '/api',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'DairyFarm AIoT Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Fallback 404 handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

module.exports = app;
