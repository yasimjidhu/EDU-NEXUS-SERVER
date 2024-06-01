import { AuthService } from "../../adapters/services/AuthService";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../infrastructure/repositories/userRepository";


export class LoginUseCase{
    constructor(
        private userRepository:UserRepository,
        private authService:AuthService
    ){}

    async execute(email:string,password:string):Promise<string>{
        const user = await this.userRepository.findByEmail(email)
        if(!user || !(await this.authService.comparePassword(password,user.hashedPassword))){
            throw new Error('Invalid email or password')
        }
        return this.authService.generateToken(user)
    }
}