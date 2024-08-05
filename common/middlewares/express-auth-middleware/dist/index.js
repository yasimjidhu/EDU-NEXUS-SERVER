// index.js
import { isTokenBlacklisted } from './redisService';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { redisClient } from './redisClient.';
dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || '';
export const checkTokenBlacklist = async (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' });
    }
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        // Check if the user is blocked
        const isBlocked = await redisClient.get(`blocked_user:${decoded.email}`);
        if (isBlocked) {
            return res.status(403).json({ message: 'You are blocked by the respective authority' });
        }
        // Check if the user token is blacklisted
        const tokenBlackListed = await isTokenBlacklisted(token);
        if (tokenBlackListed) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
