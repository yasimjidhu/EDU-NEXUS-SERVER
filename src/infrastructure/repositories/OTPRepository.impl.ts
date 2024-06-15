import { createClient } from "redis";
import { IOTPRepository } from "./otpRepository";

class OTPRepositoryImpl implements IOTPRepository{
    private redisClient;

    constructor(redisClient:ReturnType<typeof createClient>){
        this.redisClient = redisClient;
    }

    async saveOTP(email: string, otp: string): Promise<void> {
        const expirationTime = 180
        await this.redisClient.setEx(email,expirationTime,otp)
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const storedOtp:any = await this.redisClient.get(email)

        if(!storedOtp){
            throw new Error('OTP has expired')
        }
        return storedOtp === otp
    }
}

export {OTPRepositoryImpl}