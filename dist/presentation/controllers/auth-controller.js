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
exports.verifyOtpController = exports.sendOtpController = exports.signupController = exports.SignupController = void 0;
const authUseCase_1 = require("../../application/use-cases/authUseCase");
const userRepository_1 = require("../../infrastructure/repositories/userRepository");
class SignupController {
    constructor(signupUseCase) {
        this.signupUseCase = signupUseCase;
    }
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, email, password } = req.body;
            try {
                const user = yield this.signupUseCase.execute(username, email, password);
                console.log('Request reached in presentation layer controller');
                res.status(201).json(user);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Error in SignupController' });
            }
        });
    }
}
exports.SignupController = SignupController;
// Dependency injection setup
const userRepository = new userRepository_1.UserRepositoryImpl();
const signupUseCase = new authUseCase_1.SignupUseCase(userRepository);
exports.signupController = new SignupController(signupUseCase);
