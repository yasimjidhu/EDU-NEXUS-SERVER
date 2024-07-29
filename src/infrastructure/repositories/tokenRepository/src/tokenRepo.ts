import { Redis } from 'ioredis';

export interface ITokenRepository {
  setRefreshToken(userId: string, refreshToken: string): Promise<void>;
  getRefreshToken(userId: string): Promise<string | null>;
  deleteRefreshToken(userId: string): Promise<void>;
  setRoleChangedFlag(userId: string): Promise<void>;
  hasRoleChanged(userId: string): Promise<boolean>;
  clearRoleChangedFlag(userId: string): Promise<void>;
}

export class TokenRepository implements ITokenRepository {
  private redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.redisClient.set(userId, refreshToken, 'EX', 7 * 24 * 60 * 60);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redisClient.get(userId);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    await this.redisClient.del(userId);
  }

  async setRoleChangedFlag(userId: string): Promise<void> {
    await this.redisClient.set(`role_changed:${userId}`, 'true', 'EX', 24 * 60 * 60);
  }

  async hasRoleChanged(userId: string): Promise<boolean> {
    const flag = await this.redisClient.get(`role_changed:${userId}`);
    return flag === 'true';
  }

  async clearRoleChangedFlag(userId: string): Promise<void> {
    await this.redisClient.del(`role_changed:${userId}`);
  }
}