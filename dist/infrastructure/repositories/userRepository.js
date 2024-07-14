"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.UserRepositoryImpl = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "admin";
    UserRole["User"] = "student";
    UserRole["Instructor"] = "instructor";
})(UserRole || (UserRole = {}));
const userSchema = new mongoose_1.Schema({
    googleId: { type: String, required: false, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.User },
    isBlocked: { type: Boolean, required: false, default: false },
    profileImage: { type: String }
});
const UserModel = mongoose_1.default.model('User', userSchema);
exports.UserModel = UserModel;
class UserRepositoryImpl {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield UserModel.create({
                username: user.username,
                email: user.email,
                hashedPassword: user.hashedPassword,
                profileImage: user.profileImage !== undefined ? user.profileImage : null,
            });
            return newUser.toObject();
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user) {
                throw new Error('User object must be provided');
            }
            const updatedUser = yield UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true });
            if (!updatedUser) {
                throw new Error('User not found or update failed');
            }
            return updatedUser.toObject();
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ email });
            if (!user) {
                return null;
            }
            return user.toObject();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ id });
            return user ? user.toObject() : null;
        });
    }
    findByGoogleId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel.findOne({ googleId: id });
            return user ? user.toObject() : null;
        });
    }
    resetPassword(email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.findByEmail(email);
            if (!user) {
                return null;
            }
            yield UserModel.findOneAndUpdate({ email }, { $set: { hashedPassword } });
            return user;
        });
    }
    chaneUserRole(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel.findOneAndUpdate({ email }, { $set: { role: 'instructor' } });
            if (!updatedUser) {
                return null;
            }
            return updatedUser.toObject();
        });
    }
    updateProfileImage(userId, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel.findByIdAndUpdate(userId, { $set: { profileImage } }, { new: true });
            return updatedUser ? updatedUser.toObject() : null;
        });
    }
}
exports.UserRepositoryImpl = UserRepositoryImpl;
