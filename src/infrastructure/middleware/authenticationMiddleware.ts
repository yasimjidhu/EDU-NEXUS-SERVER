import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../adapters/services/AuthService';
import jwt, { JwtPayload } from 'jsonwebtoken';

const authService = new AuthService();

// Extend Express request to include userData
declare global {
  namespace Express {
    interface Request {
      userData?: JwtPayload;
    }
  }
}

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: string | object;
}

// Middleware to authenticate or refresh access token
export const authenticateOrRefreshToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let access_token = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!access_token && !refreshToken) {
    return res.status(401).json({ message: 'un authorized' });
  }

  if (access_token) {
    try {
      const verified = authService.verifyAccessToken(access_token);
      req.user = verified;
      return next();
    } catch (error) {
      
      console.log('Access token invalid, checking refresh token...');
    }
  }

  if (refreshToken) {
    try {
      const verified = authService.verifyRefreshToken(refreshToken) as JwtPayload;
      const user = { username: verified.username, email: verified.email };

      const newAccessToken = authService.generateAccessToken(user);
      res.cookie('access_token', newAccessToken, { httpOnly: true, secure: false, sameSite: 'strict' });

      req.user = verified;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid Refresh Token' });
    }
  }

  return res.status(401).json({ message: 'Access Denied' });
};
