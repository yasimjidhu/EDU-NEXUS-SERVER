import { AuthService } from "../../adapters/services/AuthService";
import { User } from "../../domain/entities/user";
import { UserRepository } from "../../infrastructure/repositories/userRepository";

export class LoginUseCase {
    constructor(
        private userRepository: UserRepository,
        private authService: AuthService
    ) { }

    private readonly adminEmail: string = 'admin@gmail.com';
    private readonly adminPassword: string = 'Admin@123';

    async execute(email: string, password: string): Promise<string | User> {

        if (email === this.adminEmail && password === this.adminPassword) {
            return {role:'admin'};
        } 

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Incorrect email');
        }

        const passwordMatch = await this.authService.comparePassword(password, user.hashedPassword);
        if (!passwordMatch) {
            throw new Error('Incorrect password');
        }

        return user;
    }
}
