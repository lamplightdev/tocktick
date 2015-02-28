
var redis = require('then-redis');

let client = redis.createClient({
  host: process.env.TOCKTICK_REDIS_HOST,
  port: process.env.TOCKTICK_REDIS_PORT,
  password: process.env.TOCKTICK_REDIS_PASSWORD
});

module.exports = client;

