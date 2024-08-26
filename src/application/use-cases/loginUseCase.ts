import { Request, Response } from "express";
import { User } from "@entities/user";
import { v4 as uuidv4 } from 'uuid';
import { addToBlacklist } from "@services/redisService";
import { IAuthService } from "@interfaces/services/IAuthService";
import { ITokenRepository } from '@interfaces/repositories/ITokenRepository';
import { IUserRepository } from "@interfaces/repositories/IUserRepository";
import { ILoginUseCase } from "@interfaces/usecases/ILoginUseCase";

export class LoginUseCase implements ILoginUseCase{
    constructor(
        private userRepository: IUserRepository,
        private authService: IAuthService,
        private tokenRepository:ITokenRepository
    ) { }

    private readonly adminEmail: string = 'admin@gmail.com';
    private readonly adminPassword: string = 'Admin@123';
    private readonly adminId:string = uuidv4()

    async execute(email: string, password: string): Promise<{token:string,refreshToken:string,user:User} | null | {role:string}> {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
       // Check if the credentials match admin credentials
        if (email === this.adminEmail && password === this.adminPassword) {
            const admin = {
                _id: this.adminId,
                username: 'admin@gmail.com', 
                email:'admin@gmail.com',
                role: 'admin' 
            };
            
            const token = this.authService.generateAccessToken(admin);
            const refreshToken = this.authService.generateRefreshToken(admin);
            await this.tokenRepository.setRefreshToken(admin._id, refreshToken);

            return { token, refreshToken, user: admin };
        } 

        const user = await this.userRepository.findByEmail(email);
        console.log('user in login from db is',user)
        if (!user) {
            throw new Error('Incorrect email');
        }

        if(user.isBlocked){
            console.log('use is blocked')
            throw new Error('Access Denied')
        }

        const passwordMatch = await this.authService.comparePassword(password, user.hashedPassword!);
        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }
        if(user._id){
            const token = this.authService.generateAccessToken(user)
            const refreshToken = this.authService.generateRefreshToken(user)
            await this.tokenRepository.setRefreshToken(user._id.toString(),refreshToken)

            return {token,refreshToken,user};
        }
        return null
    }
    async logout(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refresh_token;

            if (refreshToken) {
                const decoded = this.authService.verifyRefreshToken(refreshToken);
                await addToBlacklist(refreshToken); // Blacklist the token
                await this.tokenRepository.deleteRefreshToken(decoded.userId); // Remove the token from the repository
            }

            // Clear the cookies
            res.clearCookie('access_token', { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict' 
            });
            res.clearCookie('refresh_token', { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict' 
            });

            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ message: 'An error occurred during logout' });
        }
    }
}
