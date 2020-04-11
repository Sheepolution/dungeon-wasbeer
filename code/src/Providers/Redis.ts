const redis = require('redis');
const redisClient = redis.createClient();
const asyncRedis = require('async-redis');
const asyncRedisClient = asyncRedis.createClient();

export const Redis = asyncRedisClient;
export const RedisAsync = redisClient;