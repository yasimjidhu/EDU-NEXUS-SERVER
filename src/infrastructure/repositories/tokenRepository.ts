import { ITokenRepository } from "../../domain/repositories/ITokenRepository";
import { redisClient } from "../index"


export class TokenRepository implements ITokenRepository{
    async setRefreshToken(userId:string,refreshToken:string):Promise<void>{
        await redisClient.set(userId,refreshToken,{EX:7 * 24 * 60 * 60})
    }
    async getRefreshToken(userId:string):Promise<string|null>{
        return redisClient.get(userId)
    }
    async deleteRefreshToken(userId: string): Promise<void> {
        await redisClient.del(userId);
    }
     // Set a flag indicating that the  user's role has changed
    async setRoleChangedFlag(userId: string): Promise<void> {
        await redisClient.set(`role_changed:${userId}`, 'true', { EX: 24 * 60 * 60 }); // Flag expires after 24 hours
    }
    async hasRoleChanged(userId: string): Promise<boolean> {
        const flag = await redisClient.get(`role_changed:${userId}`);
        return flag === 'true';
    }
    async clearRoleChangedFlag(userId: string): Promise<void> {
        await redisClient.del(`role_changed:${userId}`);
    }
}