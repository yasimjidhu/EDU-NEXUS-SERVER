"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
console.log(process.env.REDIS_HOST);
console.log(process.env.REDIS_PORT);
const client = (0, redis_1.createClient)({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
client.on('error', (err) => {
    console.log('Redis client error', err);
});
client.connect();
exports.default = client;
