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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || '';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || '';
class AuthService {
    comparePassword(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user === null || user === void 0 ? void 0 : user._id, username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email, password: user === null || user === void 0 ? void 0 : user.hashedPassword, role: user === null || user === void 0 ? void 0 : user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user === null || user === void 0 ? void 0 : user._id, username: user === null || user === void 0 ? void 0 : user.username, email: user === null || user === void 0 ? void 0 : user.email, password: user === null || user === void 0 ? void 0 : user.hashedPassword, role: user === null || user === void 0 ? void 0 : user.role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    }
    verifyAccessToken(token) {
        try {
            if (token) {
                return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
            }
            else {
                return null;
            }
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Access token expired');
            }
            throw new Error('Invalid access token');
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            throw new Error('Invalid refresh token');
        }
    }
}
exports.AuthService = AuthService;
