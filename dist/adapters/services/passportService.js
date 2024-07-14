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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportService = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
class PassportService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.init();
    }
    init() {
        // Serialize user information to session
        passport_1.default.serializeUser((user, done) => {
            done(null, user);
        });
        // Deserialize user information from session
        passport_1.default.deserializeUser((user, done) => {
            done(null, user);
        });
    }
    setGoogleSignup() {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new Error("Google client ID or secret is not set in environment variables.");
        }
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/google/callback",
        }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                let user = yield this.userRepository.findByGoogleId(profile.id);
                if (!user) {
                    // If the user does not exist, create a new user
                    const newUser = {
                        googleId: profile.id,
                        username: profile.displayName,
                        email: ((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || "",
                        hashedPassword: "",
                        profileImage: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                    };
                    user = yield this.userRepository.createUser(newUser);
                }
                else {
                    // Update profile image if it exists in the profile
                    if (profile.photos && profile.photos.length > 0 && user._id) {
                        // Update the user's profile image in your repository or service layer
                        yield this.userRepository.updateProfileImage(user._id, profile.photos[0].value);
                    }
                }
                return done(null, user);
            }
            catch (error) {
                return done(error, null);
            }
        })));
    }
}
exports.PassportService = PassportService;
