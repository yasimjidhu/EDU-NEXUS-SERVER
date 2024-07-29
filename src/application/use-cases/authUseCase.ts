import {User} from '../../domain/entities/user'
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import GenerateOtp from './otp/generateOtpUseCase';
import bcrypt from 'bcryptjs'
import { AuthService } from '../../adapters/services/AuthService';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { redisClient } from '../../infrastructure/index';


export class SignupUseCase{
    constructor(
        private userRepository:UserRepository,
        private generateOtpUseCase:GenerateOtp,
        private authService:AuthService,
        private tokenRepository:ITokenRepository
    ){}

    async execute(username: string, email: string, password: string): Promise<{token:string,user:User}> {
        try {
            // Validate parameters
            if (!username || !email || !password) {
                throw new Error('Invalid parameters');
            }
            
            // Check if email already exists
            const userFound = await this.userRepository.findByEmail(email);
            if (userFound) {
                throw new Error('Email already exists');
            }

            // Generate OTP
            const otp = await this.generateOtpUseCase.execute(email);

            const saltRounds = 10; 
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create new user
            const user = new User('', username, email, hashedPassword);
            const token = this.authService.generateAccessToken(user)

            return {token,user} 
        } catch (error) {
            // Handle errors
            console.error('Error in SignupUseCase:', error);
            throw error; 
        }
    }
    async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as JwtPayload & { _id: string };
    
            const storedRefreshToken = await this.tokenRepository.getRefreshToken(decoded._id);
            if (storedRefreshToken !== refreshToken) {
                return null;
            }
    
            const user = { _id: decoded._id, username: decoded.username, email: decoded.email, hashedPassword: decoded.hashedPassword };
    
            const token = this.authService.generateAccessToken(user);
            const newRefreshToken = this.authService.generateRefreshToken(user);
    
            await this.tokenRepository.setRefreshToken(decoded._id, newRefreshToken);
            return { token, refreshToken: newRefreshToken };
        } catch (error) {
            return null;
        }
    }

    async hashPassword(password:string,):Promise<string>{
        const saltRounds =  10
        const hashedPassword = bcrypt.hash(password,saltRounds)
        return hashedPassword
    }
    async googleSignupUseCase(id:string):Promise<User | null>{
        const user = await this.userRepository.findByGoogleId(id)

        if(!user){
            const newUser = new User('','','','',id)
            await this.userRepository.createUser(newUser)
        }
        return user;
    }
    async findUserByEmail(email:string):Promise<User | null>{
        const user = await this.userRepository.findByEmail(email)
        if(user){
            return user
        }
        return null
    }
    async resetPassword(email:string,password:string):Promise<User|null>{
        const hashedPassword = await this.hashPassword(password)

        const updatedUser = this.userRepository.resetPassword(email,hashedPassword)

        if(!updatedUser){
            return null
        }
        return updatedUser
    }
    async resendOtp(email:string):Promise<boolean>{
        const otpSent = await this.generateOtpUseCase.execute(email)

        if(otpSent){
            return true
        }
        return false
    }
    async blockUser(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }
    
        user.isBlocked = true;
        const updatedUser = await this.userRepository.updateUser(user);
    
        if (!updatedUser) {
            throw new Error('Failed to update user'); 
        }
        
        await redisClient.set(`blocked_user:${email}`,'true')
        console.log('user email set as blacklisted')
        return updatedUser;
    }
    
    async unblockUser(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
    
        user.isBlocked = false;
        const updatedUser = await this.userRepository.updateUser(user);
    
        if (!updatedUser) {
            throw new Error('Failed to update user'); 
        }
        await redisClient.del(`blocked_user:${email}`)
        console.log('user email removed from blacklist')
    
        return updatedUser;
    }
    async changeUserRole(email: string): Promise<User | null> {
        const user =  await this.userRepository.chaneUserRole(email)
        if(!user){
            return null
        }
        await this.tokenRepository.setRoleChangedFlag(user._id!)
        console.log('user role changed set in token repository')
        return user
    }
}