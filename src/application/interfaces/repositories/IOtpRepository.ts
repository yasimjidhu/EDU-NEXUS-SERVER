export interface IOTPRepository{
    saveOTP(email:string,otp:string):Promise<void>;
    verifyOTP(email:string,otp:string):Promise<boolean>
}   