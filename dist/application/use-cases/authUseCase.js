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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupUseCase = void 0;
const user_1 = require("../../domain/entities/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../infrastructure/index");
class SignupUseCase {
    constructor(userRepository, generateOtpUseCase, authService, tokenRepository) {
        this.userRepository = userRepository;
        this.generateOtpUseCase = generateOtpUseCase;
        this.authService = authService;
        this.tokenRepository = tokenRepository;
    }
    execute(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate parameters
                if (!username || !email || !password) {
                    throw new Error('Invalid parameters');
                }
                // Check if email already exists
                const userFound = yield this.userRepository.findByEmail(email);
                if (userFound) {
                    throw new Error('Email already exists');
                }
                // Generate OTP
                const otp = yield this.generateOtpUseCase.execute(email);
                const saltRounds = 10;
                const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
                // Create new user
                const user = new user_1.User('', username, email, hashedPassword);
                const token = this.authService.generateAccessToken(user);
                return { token, user };
            }
            catch (error) {
                // Handle errors
                console.error('Error in SignupUseCase:', error);
                throw error;
            }
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const storedRefreshToken = yield this.tokenRepository.getRefreshToken(decoded._id);
                if (storedRefreshToken !== refreshToken) {
                    return null;
                }
                const user = { _id: decoded._id, username: decoded.username, email: decoded.email, hashedPassword: decoded.hashedPassword };
                const token = this.authService.generateAccessToken(user);
                const newRefreshToken = this.authService.generateRefreshToken(user);
                yield this.tokenRepository.setRefreshToken(decoded._id, newRefreshToken);
                return { token, refreshToken: newRefreshToken };
            }
            catch (error) {
                return null;
            }
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            const hashedPassword = bcryptjs_1.default.hash(password, saltRounds);
            return hashedPassword;
        });
    }
    googleSignupUseCase(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByGoogleId(id);
            if (!user) {
                const newUser = new user_1.User('', '', '', '', id);
                yield this.userRepository.createUser(newUser);
            }
            return user;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (user) {
                return user;
            }
            return null;
        });
    }
    resetPassword(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield this.hashPassword(password);
            const updatedUser = this.userRepository.resetPassword(email, hashedPassword);
            if (!updatedUser) {
                return null;
            }
            return updatedUser;
        });
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpSent = yield this.generateOtpUseCase.execute(email);
            if (otpSent) {
                return true;
            }
            return false;
        });
    }
    blockUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            user.isBlocked = true;
            const updatedUser = yield this.userRepository.updateUser(user);
            if (!updatedUser) {
                throw new Error('Failed to update user');
            }
            yield index_1.redisClient.set(`blocked_user:${email}`, 'true');
            console.log('user email set as blacklisted');
            return updatedUser;
        });
    }
    unblockUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }
            user.isBlocked = false;
            const updatedUser = yield this.userRepository.updateUser(user);
            if (!updatedUser) {
                throw new Error('Failed to update user');
            }
            yield index_1.redisClient.del(`blocked_user:${email}`);
            console.log('user email removed from blacklist');
            return updatedUser;
        });
    }
}
exports.SignupUseCase = SignupUseCase;
