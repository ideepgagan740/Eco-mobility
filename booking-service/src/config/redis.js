// src/config/redis.js
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,    // Required by BullMQ
});

// keep your helper
redis.setEx = async function (key, ttl, value) {
  return this.set(key, value, "EX", ttl);
};

module.exports = redis;
