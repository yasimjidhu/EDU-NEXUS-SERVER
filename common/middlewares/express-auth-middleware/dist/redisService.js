// redisService.js
import { redisClient } from "./redisClient.";
export const isTokenBlacklisted = async (token) => {
    const result = await redisClient.exists(token);
    return result === 1;
};
