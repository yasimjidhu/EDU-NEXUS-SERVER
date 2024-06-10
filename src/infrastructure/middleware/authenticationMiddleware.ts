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

// Middleware to authenticate access token
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('request reached in authenticatetoken middleware',req.cookies.access_token)
  console.log('header cookies',req.headers.cookie)
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const verified = authService.verifyAccessToken(token);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

// Middleware to refresh access token
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  try {
    const verified = authService.verifyRefreshToken(refreshToken) as JwtPayload
    const user = { username: verified.username, email: verified.email, role: verified.role };

    const newAccessToken = authService.generateAccessToken(user);
    res.cookie('access_token', newAccessToken, { httpOnly: true, secure: false, sameSite: 'strict' });

    (req as any).user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Refresh Token' });
  }
};
