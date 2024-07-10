import {redisClient} from '../../infrastructure/index'

export const addToBlacklist = async (token: string) => {
    await redisClient.set(token, 'blocked', { EX: 3600 }); // Expires in 1 hour
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const result = await redisClient.exists(token);
    return result === 1;
};