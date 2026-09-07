const mongoose = require('mongoose');
const dns = require('dns');

// Disable buffering so queries immediately fallback to mock data rather than hanging for 10 seconds if MongoDB is disconnected
mongoose.set('bufferCommands', false);

// Configure reliable DNS servers (Google DNS + Cloudflare) to prevent Windows SRV ECONNREFUSED resolution errors on Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if running in restricted environments
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✓ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.warn('⚠ Database connection unavailable');
    console.warn(`  Note: ${error.message}`);
    console.warn('  (Make sure MongoDB Atlas IP Whitelist is set to allow access: Network Access -> Add 0.0.0.0/0 or Current IP)');
    return null;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✓ Database disconnected');
    }
  } catch (error) {
    console.error('✗ Database disconnection failed');
    console.error(`  Error: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
