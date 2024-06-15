import bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/user';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET || '';

export class AuthService {
  async comparePassword(password: string, hashedPassword: any): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  generateAccessToken(user: User): string {
    return jwt.sign({ username: user.username,password:user.hashedPassword, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }
  
  generateRefreshToken(user: User): string {
    return jwt.sign({ username: user.username, password:user.hashedPassword, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }
  
  verifyAccessToken(token: string) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }
  
  verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }
}
