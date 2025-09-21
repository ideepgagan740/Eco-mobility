require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/eco_cars?replicaSet=rs0";
  mongoose.set("strictQuery", true);
  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ car-service MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ car-service MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
