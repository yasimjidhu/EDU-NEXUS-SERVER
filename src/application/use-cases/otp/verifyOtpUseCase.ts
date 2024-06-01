import { IOTPRepository } from "../../../infrastructure/repositories/otpRepository";
import { UserRepository } from "../../../infrastructure/repositories/userRepository";
import { User } from "../../../domain/entities/user";
import bcrypt from 'bcryptjs'

class verifyOTP{

    constructor(
        private otpRepository:IOTPRepository,
        private userRepository:UserRepository
    ){}

    async execute(email:string,otp:string,username:string,password:string):Promise<User>{

        const isValid = await this.otpRepository.verifyOTP(email,otp)

        if(!isValid){
            throw new Error('Invalid or expired otp')
        }

        // if the otp is valid , create the user
        const hashedPassword = await this.hashPassword(password)
        const newUser = new User('',username,email,hashedPassword)
        return this.userRepository.createUser(newUser)

    }

    private async hashPassword(password:string):Promise<string>{
        const saltRounds = 10
        return bcrypt.hash(password,saltRounds)
    }
}

export default verifyOTP