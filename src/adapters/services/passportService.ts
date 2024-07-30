import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { IUserRepository} from "@interfaces/repositories/IUserRepository";
import { User } from "@entities/user"; 

interface UserProfile {
  googleId: string;
  username: string;
  email: string;
  hashedPassword: string;
  profileImage?: string; 
}

export class PassportService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
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
        async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (error: any, user?: any) => void) => {
          try {
            let user: User | null = await this.userRepository.findByGoogleId(profile.id);

            if (!user) {
              // If the user does not exist, create a new user
              const newUser: UserProfile = {
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value || "",
                hashedPassword: "",
                profileImage: profile.photos?.[0]?.value,
              };
              user = await this.userRepository.createUser(newUser as unknown as User); 
            } else {
               // Update profile image if it exists in the profile
               if (profile.photos && profile.photos.length > 0 && user._id) {
                await this.userRepository.updateProfileImage(user._id, profile.photos[0].value);
              }
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
