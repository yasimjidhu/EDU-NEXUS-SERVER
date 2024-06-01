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

        const otp = await this.generateOtpUseCase.execute(email)

        const newUser = new User('',username,email,password);
        newUser.hashedPassword = await this.hashPassword(password);
        return newUser;
    }

    private async hashPassword(password:string,):Promise<string>{
        const saltRounds =  10
        const hashedPassword = bcrypt.hash(password,saltRounds)
        return hashedPassword
    }
}