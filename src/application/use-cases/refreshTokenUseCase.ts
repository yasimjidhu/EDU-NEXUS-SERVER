import { ITokenRepository } from "../../domain/repositories/ITokenRepository";
import { AuthService } from "../../adapters/services/AuthService";

export class RefreshTokenUseCase {
    constructor(
        private tokenRepository: ITokenRepository,
        private authService: AuthService
    ) {}

    async execute(refreshToken: string): Promise<string> {
        const decoded = this.authService.verifyRefreshToken(refreshToken);
    
        // Generate new access token using decoded data
        const newAccessToken = this.authService.generateAccessToken({
          _id: decoded.userId,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          hashedPassword: '', 
        });
    
        return newAccessToken;
    }
}
