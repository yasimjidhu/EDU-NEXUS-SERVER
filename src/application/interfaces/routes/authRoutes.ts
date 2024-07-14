import { Request, Router, Response } from "express";
import { SignupController } from "../controllers/auth-controller";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/userRepository";
import { OTPRepositoryImpl } from "../../../infrastructure/repositories/OTPRepository.impl";
import { SignupUseCase } from "../../use-cases/authUseCase";
import { AuthService } from "../../../adapters/services/AuthService";
import { LoginUseCase } from "../../use-cases/loginUseCase";
import { LoginController } from "../controllers/login-controller";
import GenerateOtp from "../../use-cases/otp/generateOtpUseCase";
import verifyOTP from "../../use-cases/otp/verifyOtpUseCase";
import EmailService from "../../../presentation/services/emailService";
import RedisClient from '../../../infrastructure/database/redic-client'
import passport from "passport";
import { PassportService } from "../../../adapters/services/passportService";
import { TokenRepository } from "../../../infrastructure/repositories/tokenRepository";
import TokenMiddlewares from "../../../infrastructure/middleware/refreshTokenMiddleware";
import { checkTokenBlacklist } from "../../../infrastructure/middleware/statusCheck";
import { RefreshTokenUseCase } from "../../use-cases/refreshTokenUseCase";

// Dependency injection setup
const userRepository = new UserRepositoryImpl();
const passportService = new PassportService(userRepository);
passportService.setGoogleSignup();

const emailService = new EmailService();
const authService = new AuthService();

const otpRepository = new OTPRepositoryImpl(RedisClient);
const tokenRepository = new TokenRepository();

const tokenMiddleware = new TokenMiddlewares(tokenRepository, authService);

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

router.post('/login',checkTokenBlacklist,loginController.login.bind(loginController));
router.post('/logout',loginController.logout.bind(loginController));
router.post('/refresh-token',loginController.refreshToken.bind(loginController));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }), (req: Request, res: Response) => {
    res.redirect('http://localhost:5173/home');
});

router.post('/forgot-password',signupController.handleForgotPassword.bind(signupController));
router.post('/reset-password',signupController.handleResetPassword.bind(signupController));

export default router;
