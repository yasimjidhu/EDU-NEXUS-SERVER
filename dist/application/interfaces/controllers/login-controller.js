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
class LoginController {
    constructor(loginUseCase, refreshTokenUseCase, authService, userRepository, tokenRepository) {
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.authService = authService;
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }
    isUserResult(result) {
        return result && 'token' in result && 'refreshToken' in result && 'user' in result;
    }
    isAdminResult(result) {
        return result && result.user && result.user.role === 'admin';
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.loginUseCase.execute(email, password);
                if (this.isAdminResult(result) || this.isUserResult(result)) {
                    const { token, refreshToken, user } = result;
                    res.cookie("access_token", token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "strict",
                        maxAge: 15 * 60 * 60 * 1000,
                    });
                    res.cookie("refresh_token", refreshToken, {
                        httpOnly: true,
                        secure: false,
                        sameSite: "strict",
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    });
                    res.json({ message: "Login successful", access_token: token, refresh_token: refreshToken, user });
                }
                else {
                    res.status(401).json({ message: "Invalid credentials" });
                }
            }
            catch (error) {
                console.error('Error during login:', error);
                res.status(400).json({ error: error.message });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loginUseCase.logout(req, res);
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refresh_token } = req.body;
            if (!refresh_token) {
                res.status(403).json({ message: "No refresh token provided" });
                return;
            }
            try {
                const newAccessToken = yield this.refreshTokenUseCase.execute(refresh_token);
                res.cookie("access_token", newAccessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000, // 15 minutes
                });
                res.json({ access_token: newAccessToken });
            }
            catch (error) {
                console.error("Error refreshing token:", error.message);
                res.status(401).json({ message: "Invalid refresh token" });
            }
        });
    }
}
exports.LoginController = LoginController;
