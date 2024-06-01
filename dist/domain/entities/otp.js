"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = void 0;
// entities/otp.entity.ts
class OTP {
    constructor(id, email, otp) {
        this.id = id;
        this.email = email;
        this.otp = otp;
    }
}
exports.OTP = OTP;
