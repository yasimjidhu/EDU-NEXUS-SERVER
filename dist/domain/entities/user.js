"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, username, email, hashedPassword, refreshToken, googleId, role, isBlocked) {
        this._id = _id;
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.refreshToken = refreshToken;
        this.googleId = googleId;
        this.role = role;
        this.isBlocked = isBlocked;
    }
}
exports.User = User;
