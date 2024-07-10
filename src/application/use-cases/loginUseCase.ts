import { Request, Response } from "express";
import { AuthService } from "../../adapters/services/AuthService";
import { User } from "../../domain/entities/user";
import { ITokenRepository } from "../../domain/repositories/ITokenRepository";
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import { v4 as uuidv4 } from 'uuid';

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private authService: AuthService,
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

         // Check if user is blocked
         if (user?.isBlocked) {
            throw new Error('Your account is blocked. Please contact support for assistance.');
        }

        if (!user) {
            throw new Error('Incorrect email');
        }

        const passwordMatch = await this.authService.comparePassword(password, user.hashedPassword);
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
    async logout(req:Request,res:Response):Promise<void>{
        try {
            const refreshToken = req.cookies.refresh_token;

            if (refreshToken) {
                const decoded = this.authService.verifyRefreshToken(refreshToken)
                console.log('user id in logout for remove refreshtoken from repo',decoded)
                // Remove the refresh token from the repository
                await this.tokenRepository.deleteRefreshToken(decoded.userId);
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
