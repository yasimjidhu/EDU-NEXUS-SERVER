import bcrypt from 'bcryptjs'
import { User } from '../../domain/entities/user'
import jwt,{Secret} from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const ACCESS_TOKEN_SECRET:Secret = process.env.JWT_ACCESS_TOKEN_SECRET || ''
const REFRESH_TOKEN_SECRET:Secret = process.env.JWT_REFRESH_TOKEN_SECRET || ''

export class AuthService{
    async comparePassword(password:string,hashedPassword:any):Promise<boolean>{
        return await bcrypt.compare(password,hashedPassword)
    }
    generateToken(user:User):string{
        return jwt.sign({username:user.username,email:user.email,role:user.role},'secret',{expiresIn:'1h'})
    }
    generateAccessToken(user:User):string{
        return jwt.sign({username:user.username,email:user.email,role:user.role},ACCESS_TOKEN_SECRET,{expiresIn:'15m'})
    }
    generateRefreshToken(user:User):string{
        return jwt.sign({username:user.username,email:user.email,role:user.role},REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
    }
    verifyAccessToken(token:string){
        return jwt.verify(token,ACCESS_TOKEN_SECRET)
    }
    verifyRefreshToken(token:string){
        return jwt.verify(token,REFRESH_TOKEN_SECRET)
    }

}