import { Request, Router,Response } from "express";
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
import jwt from 'jsonwebtoken'
import { User } from "../../../domain/entities/user";
import passport from "passport";
import { PassportService } from "../../../adapters/services/passportService";
import { authenticateToken,refreshAccessToken } from "../../../infrastructure/middleware/authenticationMiddleware";



//Dependency injection setup

const userRepository = new UserRepositoryImpl()
const passportService = new PassportService(userRepository)
passportService.setGoogleSignup()

const emailService = new EmailService()
const authService = new AuthService
const otpRepository = new OTPRepositoryImpl(RedisClient)

const loginUseCase = new LoginUseCase(userRepository,authService)
const verifyOtpUsecase = new verifyOTP(otpRepository,userRepository)
const generateOtpUseCase = new GenerateOtp(otpRepository,emailService)
const signupUseCase = new SignupUseCase(userRepository,generateOtpUseCase)

const signupController = new SignupController(signupUseCase,generateOtpUseCase,verifyOtpUsecase,userRepository)
const loginController = new LoginController()


const router = Router()

router.post('/signup',signupController.handleSignup.bind(signupController))
router.post('/verify-otp',signupController.handleVerifyOtp.bind(signupController))

router.post('/login',loginController.login.bind(loginController))
router.post('/logout',loginController.logout.bind(loginController))

router.get('/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/google/callback',passport.authenticate('google',{failureRedirect:'http://localhost:5173'}),(req:Request,res:Response)=>{
    res.redirect('http://localhost:5173/home')
})
router.post('/forgot-password',authenticateToken,signupController.handleForgotPassword.bind(signupController))
router.post('/reset-password',authenticateToken,signupController.handleResetPassword.bind(signupController))


export default router