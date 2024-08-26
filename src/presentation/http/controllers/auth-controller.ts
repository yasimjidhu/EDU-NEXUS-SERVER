import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { IAuthService } from "@interfaces/services/IAuthService";
import { ISignupUseCase } from "@interfaces/usecases/IAuthUseCase";
import { IUserRepository } from "@interfaces/repositories/IUserRepository";
import { ISignupController } from "@interfaces/controllers/ISignupController"
import verifyOTP from "@usecases/verifyOtpUseCase";
import GenerateOtp from "@usecases/generateOtpUseCase";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

interface UserDetails {
  username: string;
  password: string;
}

interface TicketData {
  email?: string;
  name?: string;
}

export class SignupController implements ISignupController {
  constructor(
    private signupUseCase: ISignupUseCase,
    private generateOtp: GenerateOtp,
    private verifyOtp: verifyOTP,
    private userRepository: IUserRepository,
    private authService: IAuthService,
  ) {}

  async handleSignup(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;

    try {
      const { user, token } = await this.signupUseCase.execute(username, email, password);
      res.status(201).json({ user, token });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  async handleVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, token, email } = req.body;
      if (!email || !otp) {
        throw new Error('OTP has Expired');
      }

      if (token) {
        const decodedToken = this.authService.verifyAccessToken(token);
        if (!decodedToken || typeof decodedToken !== 'object') {
          throw new Error('Invalid token');
        }

        const { username, password } = decodedToken as UserDetails;

        const user = await this.verifyOtp.execute(email, otp, username, password);
        if (!user) {
          res.status(400).json({ message: 'OTP is invalid' });
        } else {
          res.status(201).json({ user, success: true });
        }
      } else {
        const userFound = await this.verifyOtp.execute(email, otp, null, null);
        const user = await this.userRepository.findByEmail(email);

        if (userFound === true && user) {
          const access_token = this.authService.generateAccessToken(user);
          res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
          });
          res.status(200).json({ success: true, message: 'OTP verified successfully', email, user });
        } else {
          res.status(400).json({ message: 'OTP verification failed' });
        }
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async handleResendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const otpSent = await this.signupUseCase.resendOtp(email);
      if (!otpSent) {
        throw new Error('Invalid email');
      }
      res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error: any) {
      console.log('error in authController', error);
      res.status(500).json({ message: error.message });
    }
  }

  async handleGoogleSignup(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || '',
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid token payload');

      const { email, name } = payload as TicketData;

      if (!email) throw new Error('Email is missing in token payload');

      const user = await this.signupUseCase.googleSignupUseCase(email);
      res.status(200).send({ success: true, user });
    } catch (error: any) {
      res.status(400).send({ success: false, error: error.message });
    }
  }

  async handleForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      console.log(email);

      const user = await this.signupUseCase.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      const otp = await this.generateOtp.execute(email);
      res.status(200).json(email);
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ success: false, message: 'User not found, please register' });
    }
  }

  async handleResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { newPassword, email } = req.body;

      const resetPassword = this.signupUseCase.resetPassword(email, newPassword);

      if (!resetPassword) {
        throw new Error('Password reset failed');
      }
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: 'User not found, please register' });
    }
  }
}
