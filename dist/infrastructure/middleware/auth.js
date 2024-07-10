"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const jwt_access_secret = process.env.JWT_ACCESS_SECRET || 'access-scrt';
    if (!token)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, jwt_access_secret, (err, user) => {
        if (err)
            return res.sendStatus(403);
        req.user = user;
        next();
    });
};
