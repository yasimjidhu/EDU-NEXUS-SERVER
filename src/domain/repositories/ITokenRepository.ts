export interface ITokenRepository {
    setRefreshToken(userId: string, refreshToken: string): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    deleteRefreshToken(userId: string): Promise<void>;
    setRoleChangedFlag(userId: string): Promise<void>;
    hasRoleChanged(userId: string): Promise<boolean>;
  }