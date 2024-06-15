import { IOTPRepository } from "../../../infrastructure/repositories/otpRepository";
import { UserRepository } from "../../../infrastructure/repositories/userRepository";
import { User } from "../../../domain/entities/user";
import bcrypt from 'bcryptjs';

class VerifyOTP {
    constructor(
        private otpRepository: IOTPRepository,
        private userRepository: UserRepository
    ) {}

    async execute(email: string, otp: string, username: string | null, password: string | null): Promise<User | string | boolean> {
        if (!email || !otp) {
            throw new Error('OTP has expired');
        }

        const isValid = await this.otpRepository.verifyOTP(email, otp);

        if (!isValid) {
            return 'No user found in the database or invalid OTP.';
        }

        // Handle forgot password scenario where only email and OTP are required
        if (username === null && password === null) {
            return true;
        }

        // Handle user signup scenario where username and password are required
        if (username !== null && password !== null) {
            // const hashedPassword = await this.hashPassword(password);
            const newUser = new User('', username, email, password);
            return this.userRepository.createUser(newUser);
        }

        return 'Username and password are required for registration.';
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}

export default VerifyOTP;
