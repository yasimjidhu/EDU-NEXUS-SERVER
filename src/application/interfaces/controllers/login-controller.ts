import { Request,Response } from "express";
import { LoginUseCase } from "../../use-cases/loginUseCase";
import { UserRepository, UserRepositoryImpl } from "../../../infrastructure/repositories/userRepository";
import { AuthService } from "../../../adapters/services/AuthService";


const userRepository = new UserRepositoryImpl()
const authService = new AuthService()
const loginUseCase = new LoginUseCase(userRepository,authService)

export class LoginController{
    async login(req:Request,res:Response):Promise<void>{
        try {
        
            const {email,password} = req.body
            const token = await loginUseCase.execute(email,password)
            res.status(200).json({token})
        } catch (error:any) {
            res.status(400).json({error:error.message})
        }
    }

    async handleAdminLogin(req:Request,res:Response):Promise<void>{
        const {email,password} = req.body

        try {
            const adminIsValid = await loginUseCase.verifyAdmin(email,password)
            res.status(200).json(adminIsValid)
        } catch (error) {
            console.log('error in admincontroller',error)
            res.status(500).json({message:'Error in AdminController'})
        }
    }
}



    