import { Router } from "express";
import { SignupController } from "../controllers/auth-controller";
import { UserRepositoryImpl } from "../../../infrastructure/repositories/userRepository";
import GenerateOtp from "../../use-cases/otp/generateOtpUseCase";
import verifyOTP from "../../use-cases/otp/verifyOtpUseCase";
import EmailService from "../../../presentation/services/emailService";
import RedisClient from '../../../infrastructure/database/redic-client'
import { OTPRepositoryImpl } from "../../../infrastructure/repositories/OTPRepository.impl";
import { SignupUseCase } from "../../use-cases/authUseCase";


//Dependency injection setup
const userRepository = new UserRepositoryImpl()
const otpRepository = new OTPRepositoryImpl(RedisClient)
const emailService = new EmailService()

const generateOtpUseCase = new GenerateOtp(otpRepository,emailService)
const verifyOtpUsecase = new verifyOTP(otpRepository,userRepository)
const signupUseCase = new SignupUseCase(userRepository,generateOtpUseCase)

const signupController = new SignupController(signupUseCase,generateOtpUseCase,verifyOtpUsecase)

const router = Router()

router.post('/signup',signupController.handleSignup.bind(signupController))
router.post('/verify-otp',signupController.handleVerifyOtp.bind(signupController))

export default router