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
exports.refreshAccessToken = exports.authenticateToken = void 0;
const AuthService_1 = require("../../adapters/services/AuthService");
const authService = new AuthService_1.AuthService();
// Middleware to authenticate access token
const authenticateToken = (req, res, next) => {
    console.log('request reached in authenticatetoken middleware', req.cookies.access_token);
    console.log('header cookies', req.headers.cookie);
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        const verified = authService.verifyAccessToken(token);
        req.user = verified;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware to refresh access token
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        const verified = authService.verifyRefreshToken(refreshToken);
        const user = { username: verified.username, email: verified.email, role: verified.role };
        const newAccessToken = authService.generateAccessToken(user);
        res.cookie('access_token', newAccessToken, { httpOnly: true, secure: false, sameSite: 'strict' });
        req.user = verified;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid Refresh Token' });
    }
});
exports.refreshAccessToken = refreshAccessToken;
