import { User } from "@entities/user";
import { JwtPayload } from 'jsonwebtoken';

export interface IAuthService {
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  generateAccessToken(user: User | undefined): string;
  generateRefreshToken(user: User | undefined): string;
  verifyAccessToken(token: string | undefined): JwtPayload | null;
  verifyRefreshToken(token: string): JwtPayload;
}
