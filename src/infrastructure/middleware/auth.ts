import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express';
dotenv.config()


const authenticateToken = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const jwt_access_secret:string = process.env.JWT_ACCESS_SECRET || 'access-scrt'
  
    if (!token) return res.sendStatus(401);
  
    jwt.verify(token,jwt_access_secret , (err:any, user:any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
};  
