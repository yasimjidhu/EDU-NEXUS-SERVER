import {User} from '../../domain/entities/user'
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import GenerateOtp from './otp/generateOtpUseCase';
import EmailService from '../../presentation/services/emailService';
import bcrypt from 'bcryptjs'

export class SignupUseCase{
    constructor(
        private userRepository:UserRepository,
        private generateOtpUseCase:GenerateOtp,
    ){}

    async execute(username:string,email:string,password:string): Promise<User>{

        let userFound = await this.findUserByEmail(email)
        if(userFound){
            throw new Error('Email already exists')
        }

        const otp = await this.generateOtpUseCase.execute(email)

        const newUser = new User('',username,email,password);
        newUser.hashedPassword = await this.hashPassword(password);
        return newUser;
    }

    async hashPassword(password:string,):Promise<string>{
        const saltRounds =  10
        const hashedPassword = bcrypt.hash(password,saltRounds)
        return hashedPassword
    }
    async googleSignupUseCase(id:string):Promise<User | null>{
        let user = await this.userRepository.findByGoogleId(id)

        if(!user){
            const newUser = new User('','','','',id)
            await this.userRepository.createUser(newUser)
        }
        return user;
    }
    async findUserByEmail(email:string):Promise<User | null>{
        let user = await this.userRepository.findByEmail(email)
        if(user){
            return user
        }
        return null
    }
    async resetPassword(email:string,password:string):Promise<User|null>{
        let hashedPassword = await this.hashPassword(password)

        let updatedUser = this.userRepository.resetPassword(email,hashedPassword)

        if(!updatedUser){
            return null
        }
        return updatedUser
    }
    async resendOtp(email:string):Promise<boolean>{
        let otpSent = await this.generateOtpUseCase.execute(email)

        if(otpSent){
            return true
        }
        return false
    }
}