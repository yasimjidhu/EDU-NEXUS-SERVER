import { Request, Response } from "express";
import { SignupUseCase } from "../../use-cases/authUseCase";
import verifyOTP from "../../use-cases/otp/verifyOtpUseCase";
import GenerateOtp from "../../use-cases/otp/generateOtpUseCase";
import { generateToken, verifyToken } from "../../../infrastructure/utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { UserRepository } from "../../../infrastructure/repositories/userRepository";
const client = new OAuth2Client('62678914472-ll9pe5phb4tq5341lfgcgggmsinu93st.apps.googleusercontent.com');

interface UserDetails {
  username: string;
  password: string;
}

interface TicketData {
  email?: string;
  name?: string;
}

export class SignupController {
  constructor(
    private signupUseCase: SignupUseCase,
    private generateOtp: GenerateOtp,
    private verifyOtp: verifyOTP,
    private userRepository : UserRepository
  ) {}

  async handleSignup(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    try {
      const token = generateToken({ username, password });
      const user = await this.signupUseCase.execute(username, email, password);

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000
      });

      res.status(201).json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error in SignupController" });
    }
  }

  async handleVerifyOtp(req: Request, res: Response): Promise<void> {

    try {
      const { otp, token } = req.body;

      let {email} = req.body

      if(!email){
         email = req.cookies.userEmail
      }
  
      if (!email || !otp) {
        res.status(400).json({ message: 'Email and OTP are required' });
        return;
      }
  
      if (token) {
        const decodedToken = verifyToken(token);
        if (!decodedToken || typeof decodedToken !== 'object') {
          throw new Error('Invalid token');
        }
  
        const { username, password } = decodedToken as UserDetails;
  
        const user = await this.verifyOtp.execute(email, otp, username, password);
        res.status(201).json({ user });
      } else {
        const userFound = await this.verifyOtp.execute(email, otp, null, null);
  
        if (userFound) {
          res.status(200).json({ success: true });
        } else {
          res.status(400).json({ message: 'OTP verification failed' });
        }
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

  async handleGoogleSignup(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '62678914472-ll9pe5phb4tq5341lfgcgggmsinu93st.apps.googleusercontent.com'
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid token payload");

      const { email, name } = payload as TicketData;

      if (!email) throw new Error("Email is missing in token payload");

      let user = await this.signupUseCase.googleSignupUseCase(email);
      res.status(200).send({ success: true, user });
    } catch (error: any) {
      res.status(400).send({ success: false, error: error.message });
    }
  }

  async handleForgotPassword(req:Request,res:Response):Promise<void>{
    try {
      const {email} = req.body

      const user = await this.signupUseCase.findUserByEmail(email)
      if(!user){
        throw new Error('User not found')
      }

      const otp = this.generateOtp.execute(email)

      res.cookie('userEmail',email,{httpOnly:true,secure:true,maxAge:5* 60 * 1000})
      res.status(200).json({message:'Otp sent to email'})
    } catch (error:any) {
      res.status(400).json({sucess:false,error:error.message})
    }
  }
}
