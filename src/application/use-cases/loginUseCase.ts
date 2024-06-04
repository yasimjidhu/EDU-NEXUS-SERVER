import { AuthService } from "../../adapters/services/AuthService";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../infrastructure/repositories/userRepository";


export class LoginUseCase{
    constructor(
        private userRepository:UserRepository,
        private authService:AuthService
    ){}
    private email:string = 'admin@gmail.com'
    private password:string = 'admin@123'

    async execute(email:string,password:string):Promise<string>{
        const user = await this.userRepository.findByEmail(email)
        if(!user || !user.hashedPassword|| !(await this.authService.comparePassword(password,user.hashedPassword))){
            throw new Error('Invalid email or password')
        }
        return this.authService.generateToken(user)
    }

    async verifyAdmin(email:string,password:string):Promise<boolean>{
        if(email !=this.email || password != this.password){
            return false
        }
        return true
    }
}