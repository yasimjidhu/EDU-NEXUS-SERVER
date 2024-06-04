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
exports.LoginController = void 0;
const loginUseCase_1 = require("../../use-cases/loginUseCase");
const userRepository_1 = require("../../../infrastructure/repositories/userRepository");
const AuthService_1 = require("../../../adapters/services/AuthService");
const userRepository = new userRepository_1.UserRepositoryImpl();
const authService = new AuthService_1.AuthService();
const loginUseCase = new loginUseCase_1.LoginUseCase(userRepository, authService);
class LoginController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const token = yield loginUseCase.execute(email, password);
                res.status(200).json({ token });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    handleAdminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const adminIsValid = yield loginUseCase.verifyAdmin(email, password);
                res.status(200).json(adminIsValid);
            }
            catch (error) {
                console.log('error in admincontroller', error);
                res.status(500).json({ message: 'Error in AdminController' });
            }
        });
    }
}
exports.LoginController = LoginController;
