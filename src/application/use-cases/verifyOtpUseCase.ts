import bcrypt from 'bcryptjs';
import { User } from "@entities/user"
import { IOTPRepository } from "@interfaces/repositories/IOtpRepository";
import { IUserRepository } from "@interfaces/repositories/IUserRepository";
import { IVerifyOtpUseCase } from "@interfaces/usecases/IVerifyOtpUseCase";

class VerifyOTP implements IVerifyOtpUseCase{
    constructor(
        private otpRepository: IOTPRepository,
        private userRepository: IUserRepository
    ) {}

    async execute(email: string, otp: string, username: string | null, password: string | null): Promise<User | string | boolean> {
        if (!email || !otp) {
            throw new Error('OTP has expired');
        }

        const isValid = await this.otpRepository.verifyOTP(email, otp)

        if (!isValid) {
            return false
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

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}

export default VerifyOTP;
