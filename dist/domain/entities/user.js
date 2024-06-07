"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, username, email, hashedPassword, googleId, role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.googleId = googleId;
        this.role = role;
    }
}
exports.User = User;
