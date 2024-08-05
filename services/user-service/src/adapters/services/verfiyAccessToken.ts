import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv'
import { UserEntity } from '../../domain/entities/user';

dotenv.config()

const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_TOKEN_SECRET || '';
export class AuthService{

    verifyAccessToken(token: string) {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    }
    verifyRefreshToken(token: string) {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }
}
  