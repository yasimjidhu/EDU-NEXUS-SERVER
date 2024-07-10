import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import { User } from '../../domain/entities/user'


const jwt_access_secret:string = process.env.JWT_ACCESS_TOKEN_SECRET || 'access-scrt'
const access_token_expiry:string = process.env.ACCESS_TOKEN_EXPIRY || '15h'

const jwt_refresh_secret:string = process.env.JWT_REFRESH_SECRET || 'refresh-scrt'
const refresh_token_expiry = process.env.REFRESH_TOKEN_EXPIRY || '7d'

const generateAccessToken = (user:User)=>{
    return jwt.sign({id:user._id,username:user.username},jwt_access_secret,{
        expiresIn:access_token_expiry
    })
}

const generateRefreshToken = (user:User) => {
    return jwt.sign({ id: user._id, username: user.username }, jwt_refresh_secret, {
      expiresIn: refresh_token_expiry,
    });
};


const verifyAccessToken = (token:any)=>{
    return jwt.verify(token,jwt_access_secret)
}

const verifyRefreshToken = (token:any) => {
    return jwt.verify(token,jwt_refresh_secret);
};




export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}