import passport from "passport";
import { Request, Router, Response } from "express";
import { SignupController } from "@controllers/auth-controller";
import { LoginController } from "@controllers/login-controller";
import { UserRepositoryImpl } from "@repositories/userRepository";
import { OTPRepositoryImpl } from "@repositories/OTPRepository.impl";
import { TokenRepository } from "@repositories/tokenRepository";
import { RefreshTokenUseCase } from "@usecases/refreshTokenUseCase";
import GenerateOtp from "@usecases/generateOtpUseCase";
import { SignupUseCase } from "@usecases/authUseCase";
import verifyOTP from "@usecases/verifyOtpUseCase";
import { AuthService } from "@services/AuthService";
import { LoginUseCase } from "@usecases/loginUseCase";
import { PassportService } from "@services/passportService";
import EmailService from "@services/emailService";
import RedisClient from '@database/redis-client'

// Dependency injection setup
const userRepository = new UserRepositoryImpl();
const passportService = new PassportService(userRepository);
passportService.setGoogleSignup();

const emailService = new EmailService();
const authService = new AuthService();

const otpRepository = new OTPRepositoryImpl(RedisClient);
const tokenRepository = new TokenRepository();

const loginUseCase = new LoginUseCase(userRepository, authService, tokenRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(tokenRepository,authService)
const verifyOtpUsecase = new verifyOTP(otpRepository, userRepository);
const generateOtpUseCase = new GenerateOtp(otpRepository, emailService);
const signupUseCase = new SignupUseCase(userRepository, generateOtpUseCase, authService, tokenRepository);

const signupController = new SignupController(signupUseCase, generateOtpUseCase, verifyOtpUsecase, userRepository, authService);
const loginController = new LoginController(loginUseCase,refreshTokenUseCase, authService, userRepository,tokenRepository);

const router = Router();

router.post('/signup', signupController.handleSignup.bind(signupController));
router.post('/verify-otp', signupController.handleVerifyOtp.bind(signupController));
router.post('/resendOtp', signupController.handleResendOtp.bind(signupController));

router.post('/login',loginController.login.bind(loginController));
router.post('/logout',loginController.logout.bind(loginController));
router.post('/refresh-token',loginController.refreshToken.bind(loginController));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }), (req: Request, res: Response) => {
    res.redirect(`http://localhost:5173/auth-success?user=${JSON.stringify(req.user)}`);
});

router.post('/forgot-password',signupController.handleForgotPassword.bind(signupController));
router.post('/reset-password',signupController.handleResetPassword.bind(signupController));

export default router;
