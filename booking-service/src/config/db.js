require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eco_bookings?replicaSet=rs0";
  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ booking-service MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ booking-service MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
