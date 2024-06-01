"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, username, email, hashedPassword) {
        this._id = _id;
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
    }
}
exports.User = User;
