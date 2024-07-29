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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
class RefreshTokenUseCase {
    constructor(tokenRepository, authService) {
        this.tokenRepository = tokenRepository;
        this.authService = authService;
    }
    execute(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const decoded = this.authService.verifyRefreshToken(refreshToken);
            const hasRoleChanged = yield this.tokenRepository.hasRoleChanged(decoded.userId);
            let newAccessToken;
            if (hasRoleChanged) {
                newAccessToken = this.authService.generateAccessToken({
                    _id: decoded.userId,
                    username: decoded.username,
                    email: decoded.email,
                    role: 'instructor',
                    hashedPassword: ''
                });
            }
            else {
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
        });
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
