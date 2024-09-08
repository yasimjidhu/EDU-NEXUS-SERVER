import {Request,Response,NextFunction} from 'express'
import {TokenRepository} from 'token-repository'
import jwt from 'jsonwebtoken'
import Redis  from 'ioredis';
import dotenv from 'dotenv'
dotenv.config()



declare global {  
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || ""
console.log('host:',process.env.REDIS_HOST)
console.log('port:',parseInt(process.env.REDIS_PORT || '6379'))
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});
const tokenRepository = new TokenRepository(redisClient)

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const access_token = req.cookies.access_token;

  if (!access_token) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(access_token, ACCESS_TOKEN_SECRET) as any;

    // Check if the user's role has changed
    const hasRoleChanged = await tokenRepository.hasRoleChanged(decoded.userId);

    if (hasRoleChanged) {
      
      // Create a new token with the updated role
      const newToken = jwt.sign(
        { userId: decoded.userId, username: decoded.username, email: decoded.email, role: 'instructor' },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' } // Set an appropriate expiration time
      );

      // Set the new token as a cookie
      res.cookie('access_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000 // 1 hour
      });

      // Clear the role changed flag
      await tokenRepository.clearRoleChangedFlag(decoded.userId);

      // Attach the updated user info to the request
      (req as any).user = {
        userId:decoded.userId,
        username:decoded.username,
        email:decoded.email,
        password:decoded.password,
        role:'instructor'
      } ;
    } else {
      // If role hasn't changed, use the decoded token info
      (req as any).user = decoded;
    }

    next();
  } catch (error) {
    console.log('token error', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export default authMiddleware