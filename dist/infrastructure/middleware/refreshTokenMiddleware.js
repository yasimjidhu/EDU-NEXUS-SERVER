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
class TokenMiddlewares {
    constructor(tokenRepository, authService) {
        this.tokenRepository = tokenRepository;
        this.authService = authService;
    }
    refreshTokenMiddleware(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(403).json({ message: 'No refresh token provided' });
            }
            try {
                const decoded = this.authService.verifyRefreshToken(refreshToken);
                const userId = decoded.userId;
                const storedRefreshToken = yield this.tokenRepository.getRefreshToken(userId);
                if (storedRefreshToken !== refreshToken) {
                    return res.status(403).json({ message: 'Invalid refresh token' });
                }
                const newAccessToken = this.authService.generateAccessToken(userId);
                this.tokenRepository.setRefreshToken(userId, newAccessToken); // This step might be unnecessary unless you store access tokens in a DB or Redis
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                });
                return res.json({ accessToken: newAccessToken });
            }
            catch (error) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
        });
    }
}
exports.default = TokenMiddlewares;
