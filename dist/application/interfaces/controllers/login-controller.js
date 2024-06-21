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
                const user = yield loginUseCase.execute(email, password);
                if (user) {
                    const accessToken = authService.generateAccessToken(user);
                    const refreshToken = authService.generateRefreshToken(user);
                    res.cookie("access_token", accessToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "strict",
                        maxAge: 15 * 60 * 60 * 1000
                    });
                    res.cookie("refresh_token", refreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "strict",
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    });
                    console.log('logged user', user);
                    res.json({ message: "Login Successful", user: user });
                    return;
                }
                else {
                    res.status(401).json({ message: "Invalid Credentials" });
                    return;
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("access_token");
                res.clearCookie("refresh_token");
                res.json({ message: "Logout Successful" });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.LoginController = LoginController;
