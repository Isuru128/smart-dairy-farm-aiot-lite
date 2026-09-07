const app = require('../src/app');
const { connectDB } = require('../src/config/db');

module.exports = async (req, res) => {
  // Ensure database is connected for serverless invocations
  await connectDB();
  return app(req, res);
};
