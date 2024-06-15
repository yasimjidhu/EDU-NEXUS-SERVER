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
class LoginUseCase {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.adminEmail = 'admin@gmail.com';
        this.adminPassword = 'Admin@123';
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (email === this.adminEmail && password === this.adminPassword) {
                return { role: 'admin' };
            }
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error('Incorrect email');
            }
            const passwordMatch = yield this.authService.comparePassword(password, user.hashedPassword);
            if (!passwordMatch) {
                throw new Error('Incorrect password');
            }
            return user;
        });
    }
}
exports.LoginUseCase = LoginUseCase;
