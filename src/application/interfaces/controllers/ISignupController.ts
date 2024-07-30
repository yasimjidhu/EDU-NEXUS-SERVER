import {Request,Response} from 'express'

export interface ISignupController{
    handleSignup(req:Request,res:Response):Promise<void>;
    handleVerifyOtp(req: Request, res: Response): Promise<void>;
    handleResendOtp(req: Request, res: Response): Promise<void>;
    handleGoogleSignup(req: Request, res: Response): Promise<void>;
    handleForgotPassword(req: Request, res: Response): Promise<void>;
    handleResetPassword(req: Request, res: Response): Promise<void>;
}