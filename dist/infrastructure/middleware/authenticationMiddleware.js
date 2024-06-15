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
exports.authenticateOrRefreshToken = void 0;
const AuthService_1 = require("../../adapters/services/AuthService");
const authService = new AuthService_1.AuthService();
// Middleware to authenticate or refresh access token
const authenticateOrRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let access_token = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;
    if (!access_token && !refreshToken) {
        return res.status(401).json({ message: 'un authorized' });
    }
    if (access_token) {
        try {
            const verified = authService.verifyAccessToken(access_token);
            req.user = verified;
            return next();
        }
        catch (error) {
            console.log('Access token invalid, checking refresh token...');
        }
    }
    if (refreshToken) {
        try {
            const verified = authService.verifyRefreshToken(refreshToken);
            const user = { username: verified.username, email: verified.email };
            const newAccessToken = authService.generateAccessToken(user);
            res.cookie('access_token', newAccessToken, { httpOnly: true, secure: false, sameSite: 'strict' });
            req.user = verified;
            return next();
        }
        catch (error) {
            return res.status(401).json({ message: 'Invalid Refresh Token' });
        }
    }
    return res.status(401).json({ message: 'Access Denied' });
});
exports.authenticateOrRefreshToken = authenticateOrRefreshToken;
