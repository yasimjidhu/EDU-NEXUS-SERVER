"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_access_secret = process.env.JWT_ACCESS_SECRET || 'access-scrt';
const authMiddleware = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwt_access_secret);
        req.userId = decoded.userId; // Assign decoded.userId to req.userId
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
exports.authMiddleware = authMiddleware;
