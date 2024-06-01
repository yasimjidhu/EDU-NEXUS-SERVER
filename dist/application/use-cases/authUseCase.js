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
class SignupUseCase {
    constructor(userRepository, generateOtpUseCase) {
        this.userRepository = userRepository;
        this.generateOtpUseCase = generateOtpUseCase;
    }
    execute(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('auth use case reached');
            const otp = yield this.generateOtpUseCase.execute(email);
            const newUser = new user_1.User('', username, email, password);
            newUser.hashedPassword = yield this.hashPassword(password);
            console.log('user created');
            return newUser;
            // const savedUser = this.userRepository.createUser(newUser)
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = 10;
            const hashedPassword = bcryptjs_1.default.hash(password, saltRounds);
            return hashedPassword;
        });
    }
}
exports.SignupUseCase = SignupUseCase;
