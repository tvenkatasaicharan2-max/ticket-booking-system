const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\u2705 MongoDB connected');
  } catch (err) {
    console.error('\u274C MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
