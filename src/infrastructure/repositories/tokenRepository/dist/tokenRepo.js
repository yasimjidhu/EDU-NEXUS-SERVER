"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
class TokenRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async setRefreshToken(userId, refreshToken) {
        await this.redisClient.set(userId, refreshToken, 'EX', 7 * 24 * 60 * 60);
    }
    async getRefreshToken(userId) {
        return this.redisClient.get(userId);
    }
    async deleteRefreshToken(userId) {
        await this.redisClient.del(userId);
    }
    async setRoleChangedFlag(userId) {
        await this.redisClient.set(`role_changed:${userId}`, 'true', 'EX', 24 * 60 * 60);
    }
    async hasRoleChanged(userId) {
        const flag = await this.redisClient.get(`role_changed:${userId}`);
        return flag === 'true';
    }
    async clearRoleChangedFlag(userId) {
        await this.redisClient.del(`role_changed:${userId}`);
    }
}
exports.TokenRepository = TokenRepository;
