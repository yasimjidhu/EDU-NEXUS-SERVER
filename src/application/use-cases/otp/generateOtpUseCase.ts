import otpGenerator from 'otp-generator'
import {IOTPRepository} from '../../../infrastructure/repositories/otpRepository';
import EmailService from '../../../presentation/services/emailService'

class GenerateOtp{
    private otpRepository:IOTPRepository;
    private emailService:EmailService;

    constructor(otpRepository:IOTPRepository,emailService:EmailService){
        this.otpRepository = otpRepository;
        this.emailService = emailService
    }
    
    async execute(email:string):Promise<string>{
        const otp = otpGenerator.generate(4,{upperCaseAlphabets:false,specialChars:false})
        console.log('otp generated',otp)
        await this.otpRepository.saveOTP(email,otp)
        await this.emailService.sendOTPEmail(email,otp)
        console.log('otp sent to email')
        return otp
    }
}

export default GenerateOtp