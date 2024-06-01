import { Request, Response } from "express";
import { SignupUseCase } from "../../use-cases/authUseCase";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/userRepository";
import GenerateOtp from "../../use-cases/otp/generateOtpUseCase";
import verifyOTP from "../../use-cases/otp/verifyOtpUseCase";
import { generateToken, verifyToken } from "../../../infrastructure/utils/jwt";



interface UserDetails {
  username: string;
  password: string;
}

export class SignupController {
  constructor(
    private signupUseCase: SignupUseCase,
    private generateOtp: GenerateOtp,
    private verifyOtp: verifyOTP
  ) {}

  async handleSignup(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    try {
      const token = generateToken({ username, password });
      const user = await this.signupUseCase.execute(username, email, password);

      res.cookie('token',token,{
        httpOnly:true,
        secure:true,
        sameSite:'strict',
        maxAge:3600000
      })

      res.status(201).json({user:user,token:token});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error in SignupController" });
    }
  }

  async handleVerifyOtp(req: Request, res: Response): Promise<void> {

    const { email, otp,token } = req.body;
    try {

      const decodedToken = verifyToken(token);
      if (!decodedToken || typeof decodedToken !== "object") throw new Error("Invalid token");

      const { username, password } = decodedToken as UserDetails;

      const user = await this.verifyOtp.execute(email, otp, username, password);
      
      res.status(201).json({ user });

    } catch (error: any) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
}
