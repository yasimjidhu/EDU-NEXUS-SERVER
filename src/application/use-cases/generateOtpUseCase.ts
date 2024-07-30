import otpGenerator from 'otp-generator'
import {IOTPRepository} from '@interfaces/repositories/IOtpRepository';
import { IEmailService } from '@interfaces/services/IEmailService';
import { IGenerateOtp } from '@interfaces/usecases/IGenerateOtp';

export class GenerateOtp implements IGenerateOtp{
    private otpRepository:IOTPRepository;
    private emailService:IEmailService;

    constructor(otpRepository:IOTPRepository,emailService:IEmailService){
        this.otpRepository = otpRepository;
        this.emailService = emailService
    }
    
    async execute(email:string):Promise<string>{
        const otp = otpGenerator.generate(4,{upperCaseAlphabets:false,specialChars:false})
        console.log('otp generated',otp)
        await this.otpRepository.saveOTP(email,otp)
        await this.emailService.sendOTPEmail(email,otp)
        console.log(`otp sent to ${email}`)
        return otp
    }
}

export default GenerateOtp