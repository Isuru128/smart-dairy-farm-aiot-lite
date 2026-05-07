const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const cowRoutes = require('./routes/cows');
const milkRoutes = require('./routes/milk');
const iotRoutes = require('./routes/iot');
const employeeRoutes = require('./routes/employees');
const financeRoutes = require('./routes/finance');
const inventoryRoutes = require('./routes/inventory');
const alertRoutes = require('./routes/alerts');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cows', authenticateToken, cowRoutes);
app.use('/api/milk', authenticateToken, milkRoutes);
app.use('/api/iot', authenticateToken, iotRoutes);
app.use('/api/employees', authenticateToken, authorizeRoles('admin', 'manager'), employeeRoutes);
app.use('/api/finance', authenticateToken, authorizeRoles('admin', 'manager', 'finance'), financeRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/alerts', authenticateToken, alertRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle real-time updates
  socket.on('join-room', (room) => {
    socket.join(room);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };