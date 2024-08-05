import {Request,Response,NextFunction} from 'express'
import jwt from 'jsonwebtoken'


declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || ""

 const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('req.cookies in authmidllware',req.cookies.access_token)
  const access_token = req.cookies.access_token
  if (!access_token) {
      return res.status(401).json({ message: 'Un Authorized' });
  }

  try {
      const decoded = jwt.verify(access_token, ACCESS_TOKEN_SECRET);
      (req as any).user = decoded; 
      console.log('decoded below',decoded)
      next();
  } catch (error) {
      return res.status(403).json({ message: 'Invalid token' });
  }
};

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
export default authMiddleware