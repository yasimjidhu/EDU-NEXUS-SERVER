import { IEmailService } from '@interfaces/services/IEmailService';
import nodemailer from 'nodemailer'

class EmailService implements IEmailService{
    private transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        })
    }
    async sendOTPEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code for Signup - Edu-Nexus',
            text: `Dear Edu-Nexus User,
    
    This is your OTP code for signing up on Edu-Nexus: ${otp}
    
    Please enter this code in the OTP verification field to complete your registration.
    
    Best regards,
    The Edu-Nexus Team`
        };
        await this.transporter.sendMail(mailOptions);
    }
}

export default EmailService 