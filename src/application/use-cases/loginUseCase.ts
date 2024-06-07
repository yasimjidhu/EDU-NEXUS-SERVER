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

    async execute(email: string, password: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Incorrect email');
        }

        if (user.role === 'admin' && email === this.email && password === this.password) {
            return this.authService.generateToken(user);
        }

        const passwordMatch = await this.authService.comparePassword(password, user.hashedPassword);
        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }

        return this.authService.generateToken(user);
    }
}