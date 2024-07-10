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
exports.LoginUseCase = void 0;
const uuid_1 = require("uuid");
class LoginUseCase {
    constructor(userRepository, authService, tokenRepository) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.tokenRepository = tokenRepository;
        this.adminEmail = 'admin@gmail.com';
        this.adminPassword = 'Admin@123';
        this.adminId = (0, uuid_1.v4)();
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            // Check if the credentials match admin credentials
            if (email === this.adminEmail && password === this.adminPassword) {
                const admin = {
                    _id: this.adminId,
                    username: 'admin@gmail.com',
                    email: 'admin@gmail.com',
                    role: 'admin'
                };
                const token = this.authService.generateAccessToken(admin);
                const refreshToken = this.authService.generateRefreshToken(admin);
                yield this.tokenRepository.setRefreshToken(admin._id, refreshToken);
                return { token, refreshToken, user: admin };
            }
            const user = yield this.userRepository.findByEmail(email);
            // Check if user is blocked
            if (user === null || user === void 0 ? void 0 : user.isBlocked) {
                throw new Error('Your account is blocked. Please contact support for assistance.');
            }
            if (!user) {
                throw new Error('Incorrect email');
            }
            const passwordMatch = yield this.authService.comparePassword(password, user.hashedPassword);
            if (!passwordMatch) {
                throw new Error('Incorrect password');
            }
            if (user._id) {
                const token = this.authService.generateAccessToken(user);
                const refreshToken = this.authService.generateRefreshToken(user);
                yield this.tokenRepository.setRefreshToken(user._id.toString(), refreshToken);
                return { token, refreshToken, user };
            }
            return null;
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refresh_token;
                if (refreshToken) {
                    const decoded = this.authService.verifyRefreshToken(refreshToken);
                    console.log('user id in logout for remove refreshtoken from repo', decoded);
                    // Remove the refresh token from the repository
                    yield this.tokenRepository.deleteRefreshToken(decoded.userId);
                }
                // Clear the cookies
                res.clearCookie('access_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                res.clearCookie('refresh_token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });
                res.status(200).json({ message: 'Logout successful' });
            }
            catch (error) {
                console.error('Logout error:', error);
                res.status(500).json({ message: 'An error occurred during logout' });
            }
        });
    }
}
exports.LoginUseCase = LoginUseCase;
