const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test_db';

async function connectAndSeed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to test database");

    console.log("🌱 Test DB is ready");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error setting up test DB:", err);
    process.exit(1);
  }
}

connectAndSeed();
