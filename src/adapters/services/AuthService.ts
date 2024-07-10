import bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/user';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET || '';

export class AuthService {
  async comparePassword(password: string, hashedPassword: any): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  generateAccessToken(user: User |undefined): string {
    return jwt.sign({userId:user?._id,username:user?.username,email:user?.email,password:user?.hashedPassword,role:user?.role}, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }
  
  generateRefreshToken(user: User|undefined): string {
    return jwt.sign({userId:user?._id,username:user?.username,email:user?.email,password:user?.hashedPassword,role:user?.role}, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }
  
  verifyAccessToken(token: string|undefined): JwtPayload | null {
    try {
      if(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
      }else{
        return null
      }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      throw new Error('Invalid access token');
    }
  }
  
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      throw new Error('Invalid refresh token');
    }
  }
}
