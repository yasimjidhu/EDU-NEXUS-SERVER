// entities/otp.entity.ts
export class OTP {
    private id: string;
    private email: string;
    private otp: string;
  
    constructor(id: string, email: string, otp: string) {
      this.id = id;
      this.email = email;
      this.otp = otp;
    }
  }