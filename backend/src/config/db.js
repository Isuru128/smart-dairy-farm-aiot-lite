const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    const connectionPromise = mongoose.connect(mongoUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });

    // Set a timeout for connection attempts
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    console.log('✓ Database connected successfully');

    return mongoose.connection;
  } catch (error) {
    console.warn('⚠ Database connection unavailable');
    console.warn(`  Note: ${error.message}`);
    
    // Continue server startup without database
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
