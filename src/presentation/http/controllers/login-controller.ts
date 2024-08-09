import { Request, Response } from "express";
import { LoginUseCase } from "@usecases/loginUseCase";
import { IUserRepository } from "@interfaces/repositories/IUserRepository";
import { AuthService } from "@services/AuthService";
import { User } from "@entities/user";
import { TokenRepository } from "@repositories/tokenRepository";
import { RefreshTokenUseCase } from "@usecases/refreshTokenUseCase";

export class LoginController {
  constructor(
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase:RefreshTokenUseCase,
    private authService: AuthService,
    private userRepository: IUserRepository,
    private tokenRepository:TokenRepository
  ) {}

  private isUserResult(result: any): result is { token: string, refreshToken: string, user: User } {
    return result && 'token' in result && 'refreshToken' in result && 'user' in result;
  }

  private isAdminResult(result: any): result is { token: string, refreshToken: string, user: { _id: string, username: string, email: string, role: string } } {
    return result && result.user && result.user.role === 'admin';
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.loginUseCase.execute(email, password);
  
      if (this.isAdminResult(result) || this.isUserResult(result)) {
        const { token, refreshToken, user } = result;
  
        res.cookie("access_token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 15 * 60 * 60 * 1000,
        });
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({ message: "Login successful", access_token: token, refresh_token: refreshToken, user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      res.status(400).json({ error: error.message });
    }
  }

async logout(req: Request, res: Response): Promise<void> {
  await this.loginUseCase.logout(req, res);
}
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        res.status(403).json({ message: "No refresh token provided" });
        return;
    }

    try {
        const newAccessToken = await this.refreshTokenUseCase.execute(refresh_token);

        res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.json({ access_token: newAccessToken });
    } catch (error: any) {
        console.error("Error refreshing token:", error.message);
        res.status(401).json({ message: "Invalid refresh token" });
    }
}
}
