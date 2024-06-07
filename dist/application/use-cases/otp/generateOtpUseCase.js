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
const otp_generator_1 = __importDefault(require("otp-generator"));
class GenerateOtp {
    constructor(otpRepository, emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }
    execute(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = otp_generator_1.default.generate(4, { upperCaseAlphabets: false, specialChars: false });
            console.log('otp generated', otp);
            yield this.otpRepository.saveOTP(email, otp);
            yield this.emailService.sendOTPEmail(email, otp);
            console.log(`otp sent to ${email}`);
            return otp;
        });
    }
}
exports.default = GenerateOtp;
