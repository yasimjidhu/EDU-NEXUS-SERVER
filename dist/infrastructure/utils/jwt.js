"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwt_access_secret = process.env.JWT_ACCESS_TOKEN_SECRET || 'access-scrt';
const access_token_expiry = process.env.ACCESS_TOKEN_EXPIRY || '15h';
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET || 'refresh-scrt';
const refresh_token_expiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const generateAccessToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, jwt_access_secret, {
        expiresIn: access_token_expiry
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, jwt_refresh_secret, {
        expiresIn: refresh_token_expiry,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwt_access_secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, jwt_refresh_secret);
};
exports.verifyRefreshToken = verifyRefreshToken;
