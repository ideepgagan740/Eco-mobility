// src/cache/CarCache.js
const redis = require('../config/redis'); // your Redis client
const keys = require('../cache/redisKeys'); // reusing your keys

const ttlSec = 120; // cache for 2 minutes

function listKey(params) {
  // You can make keys param-sensitive (filters, page, limit, sort)
  const hash = JSON.stringify(params);
  return `${keys.carsList}:${Buffer.from(hash).toString('base64')}`;
}

exports.getList = async (params) => {
  const key = listKey(params);
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
};

exports.setList = async (params, payload) => {
  const key = listKey(params);
  await redis.setEx(key, ttlSec, JSON.stringify(payload));
};

exports.invalidateLists = async () => {
  // Delete all keys matching cars:list:*
  const pattern = `${keys.carsList}:*`;
  const keysToDelete = await redis.keys(pattern);
  if (keysToDelete.length) {
    await redis.del(...keysToDelete);
  }
};

exports.getDetails = async (id) => {
  const val = await redis.get(keys.carDetails(id));
  return val ? JSON.parse(val) : null;
};

exports.setDetails = async (id, payload) => {
  await redis.setEx(keys.carDetails(id), ttlSec, JSON.stringify(payload));
};

exports.invalidateDetails = async (id) => {
  await redis.del(keys.carDetails(id));
};
