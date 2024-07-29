import { ITokenRepository } from "../../domain/repositories/ITokenRepository";
import { AuthService } from "../../adapters/services/AuthService";

export class RefreshTokenUseCase {
    constructor(
        private tokenRepository: ITokenRepository,
        private authService: AuthService
    ) {}

    async execute(refreshToken: string): Promise<string> {
        const decoded = this.authService.verifyRefreshToken(refreshToken);
        const hasRoleChanged = await this.tokenRepository.hasRoleChanged(decoded.userId);

        let newAccessToken: string;
        
        if (hasRoleChanged) {
            newAccessToken = this.authService.generateAccessToken({
                _id: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: 'instructor',
                hashedPassword: ''
            });
        } else {
            // Generate new access token using decoded data
            newAccessToken = this.authService.generateAccessToken({
                _id: decoded.userId,
                username: decoded.username,
                email: decoded.email,
                role: decoded.role,
                hashedPassword: '',
            });
        }

        return newAccessToken;
    }
}
