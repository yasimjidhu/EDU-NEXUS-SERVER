import { NextFunction, Request, Response } from "express";

export const authorize = (roles: Array<'student' | 'mentor' | 'admin'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.userData?.role && roles.includes(req.userData.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Authorization failed' }); 
    }
  }
}