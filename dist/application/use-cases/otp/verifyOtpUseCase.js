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
const user_1 = require("../../../domain/entities/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class VerifyOTP {
    constructor(otpRepository, userRepository) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
    }
    execute(email, otp, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !otp) {
                throw new Error('OTP has expired');
            }
            const isValid = yield this.otpRepository.verifyOTP(email, otp);
            console.log('otp is isValid', isValid);
            if (!isValid) {
                return false;
            }
            // Handle forgot password scenario where only email and OTP are required
            if (username === null && password === null) {
                return true;
            }
            // Handle user signup scenario where username and password are required
            if (username !== null && password !== null) {
                // const hashedPassword = await this.hashPassword(password);
                const newUser = new user_1.User('', username, email, password);
                return this.userRepository.createUser(newUser);
            }
            return 'Username and password are required for registration.';
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            return bcryptjs_1.default.hash(password, saltRounds);
        });
    }
}
exports.default = VerifyOTP;
