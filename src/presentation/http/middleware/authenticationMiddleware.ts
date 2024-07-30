import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string; 
    }
  }
}

const jwt_access_secret:string = process.env.JWT_ACCESS_SECRET || 'access-scrt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded: any = jwt.verify(token, jwt_access_secret);
        req.userId = decoded.userId; // Assign decoded.userId to req.userId
        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
