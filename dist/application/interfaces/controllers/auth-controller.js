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
exports.SignupController = void 0;
const jwt_1 = require("../../../infrastructure/utils/jwt");
class SignupController {
    constructor(signupUseCase, generateOtp, verifyOtp) {
        this.signupUseCase = signupUseCase;
        this.generateOtp = generateOtp;
        this.verifyOtp = verifyOtp;
    }
    handleSignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = req.body;
            try {
                const token = (0, jwt_1.generateToken)({ username, password });
                const user = yield this.signupUseCase.execute(username, email, password);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 3600000
                });
                res.status(201).json({ user: user, token: token });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Error in SignupController" });
            }
        });
    }
    handleVerifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, otp, token } = req.body;
            try {
                const decodedToken = (0, jwt_1.verifyToken)(token);
                if (!decodedToken || typeof decodedToken !== "object")
                    throw new Error("Invalid token");
                const { username, password } = decodedToken;
                const user = yield this.verifyOtp.execute(email, otp, username, password);
                res.status(201).json({ user });
            }
            catch (error) {
                console.error(error);
                res.status(400).json({ message: error.message });
            }
        });
    }
}
exports.SignupController = SignupController;
