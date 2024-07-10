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
exports.TokenRepository = void 0;
const index_1 = require("../index");
class TokenRepository {
    setRefreshToken(userId, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            yield index_1.redisClient.set(userId, refreshToken, { EX: 7 * 24 * 60 * 60 });
        });
    }
    getRefreshToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return index_1.redisClient.get(userId);
        });
    }
    deleteRefreshToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield index_1.redisClient.del(userId);
        });
    }
}
exports.TokenRepository = TokenRepository;
