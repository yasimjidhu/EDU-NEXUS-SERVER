import { User } from "@entities/user";

export interface IVerifyOtpUseCase{
    execute(email:string,otp:string,username:string|null,password:string | null):Promise<User | string | boolean>;
    hashPassword(password: string): Promise<string>
}