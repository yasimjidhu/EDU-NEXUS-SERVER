"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupController = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client('62678914472-ll9pe5phb4tq5341lfgcgggmsinu93st.apps.googleusercontent.com');
class SignupController {
    constructor(signupUseCase, generateOtp, verifyOtp, userRepository, authService) {
        this.signupUseCase = signupUseCase;
        this.generateOtp = generateOtp;
        this.verifyOtp = verifyOtp;
        this.userRepository = userRepository;
        this.authService = authService;
    }
    handleSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = req.body;
            try {
                const { user, token } = yield this.signupUseCase.execute(username, email, password);
                res.status(201).json({ user: user, token });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: error.message });
            }
        });
    }
    handleVerifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, token, email } = req.body;
                if (!email || !otp) {
                    throw new Error('OTP has  Expired');
                }
                if (token) {
                    const decodedToken = this.authService.verifyAccessToken(token);
                    if (!decodedToken || typeof decodedToken !== 'object') {
                        throw new Error('Invalid token');
                    }
                    const { username, password } = decodedToken;
                    const user = yield this.verifyOtp.execute(email, otp, username, password);
                    console.log('the otp is ', user);
                    if (!user) {
                        res.status(400).json({ message: 'otp is invAlid' });
                    }
                    else {
                        res.status(201).json({ user, success: true });
                    }
                }
                else {
                    const userFound = yield this.verifyOtp.execute(email, otp, null, null);
                    const user = yield this.userRepository.findByEmail(email);
                    if (userFound === true && user) {
                        const access_token = this.authService.generateAccessToken(user);
                        res.cookie('access_token', access_token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'strict',
                            maxAge: 15 * 60 * 1000
                        });
                        res.status(200).json({ success: true, message: 'Otp verified successfully', email, user });
                    }
                    else {
                        res.status(400).json({ message: 'OTP verification failed' });
                    }
                }
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    handleResendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            try {
                const otpSent = yield this.signupUseCase.resendOtp(email);
                if (!otpSent) {
                    throw new Error('invalid email');
                }
                res.status(200).json({ message: 'Otp sent to your email' });
            }
            catch (error) {
                console.log('error in authController', error);
                res.status(500).json({ message: error.message });
            }
        });
    }
    handleGoogleSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.body;
            try {
                const ticket = yield client.verifyIdToken({
                    idToken: token,
                    audience: '62678914472-ll9pe5phb4tq5341lfgcgggmsinu93st.apps.googleusercontent.com'
                });
                const payload = ticket.getPayload();
                if (!payload)
                    throw new Error("Invalid token payload");
                const { email, name } = payload;
                if (!email)
                    throw new Error("Email is missing in token payload");
                let user = yield this.signupUseCase.googleSignupUseCase(email);
                res.status(200).send({ success: true, user });
            }
            catch (error) {
                res.status(400).send({ success: false, error: error.message });
            }
        });
    }
    handleForgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log(email);
                const user = yield this.signupUseCase.findUserByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }
                const otp = yield this.generateOtp.execute(email);
                res.status(200).json(email);
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ sucess: false, message: 'User not found, please register' });
            }
        });
    }
    handleResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { newPassword, email } = req.body;
                const resetPassword = this.signupUseCase.resetPassword(email, newPassword);
                if (!resetPassword) {
                    throw new Error('password reset failed');
                }
                res.status(200).json({ message: 'Password updated successfully' });
            }
            catch (error) {
                res.status(400).json({ sucess: false, message: 'User not found, please register' });
            }
        });
    }
}
exports.SignupController = SignupController;
