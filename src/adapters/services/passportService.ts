import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserRepository } from "../../infrastructure/repositories/userRepository";
import { User } from "../../domain/entities/user"; // Ensure this import matches your project structure

interface UserProfile {
  googleId: string;
  username: string;
  email: string;
  hashedPassword: string;
}

export class PassportService {
  private userRepository: UserRepository;
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
    this.init();
  }

  private init() {
    // Serialize user information to session
    passport.serializeUser((user: any, done) => {
      done(null, user);
    });

    // Deserialize user information from session
    passport.deserializeUser((user: any, done) => {
      done(null, user);
    });
  }

  public setGoogleSignup() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google client ID or secret is not set in environment variables.");
    }

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "http://localhost:3001/auth/google/callback",
        },
        async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
          try {
            let user = await this.userRepository.findByGoogleId(profile.id);

            if (!user) {
              // if the user does not exist create a new user
              const newUser: UserProfile = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                hashedPassword: "",
              };
              user = await this.userRepository.createUser(newUser as unknown as User); // Cast if necessary
            }

            return done(null, user);
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );
  }
}
