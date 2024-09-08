import { NextFunction, Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Admin access required' });
    }
  };
  
  export const instructorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'instructor') {
      next();
    } else {
      return res.status(403).json({ message: 'Instructor access required' });
    }
  };
  
  export const studentMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'student') {
      next();
    } else {
      return res.status(403).json({ message: 'Student access required' });
    }
  };