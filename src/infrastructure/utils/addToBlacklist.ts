import {redisClient} from  '../../infrastructure/index'

export const addToBlacklist = async (token: string): Promise<void> => {
    redisClient.set(token, 'blocked', { EX: 3600 }); // Expires in 1 hour
};
