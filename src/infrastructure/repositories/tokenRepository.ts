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
}