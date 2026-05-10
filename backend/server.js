require('dotenv').config(); // MUST be FIRST

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ DairyFarm AIoT Backend is ready`);
    });
  } catch (error) {
    console.error('✗ Failed to start server');
    console.error(`  Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
