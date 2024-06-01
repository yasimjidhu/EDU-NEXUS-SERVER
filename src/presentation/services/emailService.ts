import nodemailer from 'nodemailer'

class EmailService{
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
    async sendOTPEmail(email:string,otp:string):Promise<void>{
        const mailOptions={
            from:process.env.EMAIL_USER,
            to:email,
            subject: 'Your OTP Code for Signup',
            text: `this is your otp code ${otp} `
        }
        await this.transporter.sendMail(mailOptions)
    }
}

export default EmailService