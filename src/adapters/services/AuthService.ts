import bcrypt from 'bcryptjs'
import { User } from '../../domain/entities/user'
import jwt from 'jsonwebtoken'

export class AuthService{
    async comparePassword(password:string,hashedPassword:any):Promise<boolean>{
        return await bcrypt.compare(password,hashedPassword)
    }
    generateToken(user:User):string{
        return jwt.sign({username:user.username,email:user.email,role:user.role},'secret',{expiresIn:'1h'})
    }
}