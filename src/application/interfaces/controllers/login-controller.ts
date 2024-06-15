import { Request, Response } from "express";
import { LoginUseCase } from "../../use-cases/loginUseCase";
import {
  UserRepository,
  UserRepositoryImpl,
} from "../../../infrastructure/repositories/userRepository";
import { AuthService } from "../../../adapters/services/AuthService";
import { User } from "../../../domain/entities/user";

const userRepository = new UserRepositoryImpl();
const authService = new AuthService();
const loginUseCase = new LoginUseCase(userRepository, authService);

export class LoginController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await loginUseCase.execute(email, password);

      if (user) {
        const accessToken = authService.generateAccessToken(user as User);
        const refreshToken = authService.generateRefreshToken(user as User);

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge:15 * 60 * 60 *1000
        });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ message: "Login Successful",user:user });
        return;
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
        return;
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }


  async logout(req: Request, res: Response): Promise<void> {
    try {
  
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      res.json({ message: "Logout Successful" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
