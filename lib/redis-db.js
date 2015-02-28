
var redis = require('then-redis');

let client = redis.createClient(
  process.env.TOCKTICK_REDIS_PORT,
  process.env.TOCKTICK_REDIS_HOST,
  {}
);

module.exports = client;

