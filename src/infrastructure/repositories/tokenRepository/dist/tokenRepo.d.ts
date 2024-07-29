import { Redis } from 'ioredis';
export interface ITokenRepository {
    setRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    deleteRefreshToken(userId: string): Promise<void>;
    setRoleChangedFlag(userId: string): Promise<void>;
    hasRoleChanged(userId: string): Promise<boolean>;
    clearRoleChangedFlag(userId: string): Promise<void>;
}
export declare class TokenRepository implements ITokenRepository {
    private redisClient;
    constructor(redisClient: Redis);
    setRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    deleteRefreshToken(userId: string): Promise<void>;
    setRoleChangedFlag(userId: string): Promise<void>;
    hasRoleChanged(userId: string): Promise<boolean>;
    clearRoleChangedFlag(userId: string): Promise<void>;
}
