require("dotenv").config(); // Load environment variables at the top
const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eco_users?replicaSet=rs0";
  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ user-service MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ user-service MongoDB connection error:", err.message);
    process.exit(1); // Exit the app if DB connection fails
  }
}

module.exports = { connectDB };
