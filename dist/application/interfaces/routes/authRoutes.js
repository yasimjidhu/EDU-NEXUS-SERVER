"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const userRepository_1 = require("../../../infrastructure/repositories/userRepository");
const OTPRepository_impl_1 = require("../../../infrastructure/repositories/OTPRepository.impl");
const authUseCase_1 = require("../../use-cases/authUseCase");
const AuthService_1 = require("../../../adapters/services/AuthService");
const loginUseCase_1 = require("../../use-cases/loginUseCase");
const login_controller_1 = require("../controllers/login-controller");
const generateOtpUseCase_1 = __importDefault(require("../../use-cases/otp/generateOtpUseCase"));
const verifyOtpUseCase_1 = __importDefault(require("../../use-cases/otp/verifyOtpUseCase"));
const emailService_1 = __importDefault(require("../../../presentation/services/emailService"));
const redic_client_1 = __importDefault(require("../../../infrastructure/database/redic-client"));
const passport_1 = __importDefault(require("passport"));
const passportService_1 = require("../../../adapters/services/passportService");
//Dependency injection setup
const userRepository = new userRepository_1.UserRepositoryImpl();
const passportService = new passportService_1.PassportService(userRepository);
passportService.setGoogleSignup();
const emailService = new emailService_1.default();
const authService = new AuthService_1.AuthService;
const otpRepository = new OTPRepository_impl_1.OTPRepositoryImpl(redic_client_1.default);
const loginUseCase = new loginUseCase_1.LoginUseCase(userRepository, authService);
const verifyOtpUsecase = new verifyOtpUseCase_1.default(otpRepository, userRepository);
const generateOtpUseCase = new generateOtpUseCase_1.default(otpRepository, emailService);
const signupUseCase = new authUseCase_1.SignupUseCase(userRepository, generateOtpUseCase);
const signupController = new auth_controller_1.SignupController(signupUseCase, generateOtpUseCase, verifyOtpUsecase, userRepository, authService);
const loginController = new login_controller_1.LoginController();
const router = (0, express_1.Router)();
router.post('/signup', signupController.handleSignup.bind(signupController));
router.post('/verify-otp', signupController.handleVerifyOtp.bind(signupController));
router.post('/resendOtp', signupController.handleResendOtp.bind(signupController));
router.post('/login', loginController.login.bind(loginController));
router.post('/logout', loginController.logout.bind(loginController));
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: 'http://localhost:5173' }), (req, res) => {
    console.log('response of google', res);
    res.redirect('http://localhost:5173/home');
});
router.post('/forgot-password', signupController.handleForgotPassword.bind(signupController));
router.post('/reset-password', signupController.handleResetPassword.bind(signupController));
exports.default = router;
