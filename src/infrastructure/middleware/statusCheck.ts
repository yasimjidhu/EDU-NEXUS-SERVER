import { isTokenBlacklisted } from '../../adapters/services/redisService';
import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { redisClient } from '..';

dotenv.config()

const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_ACCESS_TOKEN_SECRET || '';

export const checkTokenBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    console.log('request reached in middleware')
    const token = req.headers.authorization?.split(' ')[1];
    console.log('token in middleware',token)
    if (!token) {
        console.log('authorization token is missing',token)
        return res.status(401).json({ message: 'Authorization token missing' });
    }

    try {
        const decoded:any = jwt.verify(token,ACCESS_TOKEN_SECRET)
        console.log('user token',decoded)

        //check if the user is blocked
        const isBlocked = await redisClient.get(`blocked_user:${decoded.email}`)
        console.log('user isblocked',isBlocked)
        if(isBlocked){
            return res.status(403).json({message:'User is blocked'})
        }

        const tokenBlackListed = await isTokenBlacklisted(token);
        console.log('user blocked is ',tokenBlackListed)
        if (tokenBlackListed) {
            console.log('user  tokenBlackListed')
            return res.status(403).json({ message: 'Un Authorized' });
        }
        req.user = decoded
        next();
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
