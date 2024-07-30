import { Request, Response } from 'express';

import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { AuthService } from '../../../adapters/services/AuthService';


class TokenMiddlewares {
  constructor(
    private tokenRepository:ITokenRepository,
    private authService:AuthService
) {}

    async refreshTokenMiddleware(req: Request, res: Response) {
    const {refreshToken } = req.body

    if (!refreshToken) {
      return res.status(403).json({ message: 'No refresh token provided' });
    }

    try {
      const decoded = this.authService.verifyRefreshToken(refreshToken);
      const userId = (decoded as any).userId;

      const storedRefreshToken = await this.tokenRepository.getRefreshToken(userId);
      if (storedRefreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      const newAccessToken = this.authService.generateAccessToken(userId);

      this.tokenRepository.setRefreshToken(userId, newAccessToken); // This step might be unnecessary unless you store access tokens in a DB or Redis

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
}

export default TokenMiddlewares;
