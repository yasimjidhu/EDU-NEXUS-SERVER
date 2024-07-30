import { User } from "@entities/user";

export interface ISignupUseCase {
  execute(username: string, email: string, password: string): Promise<{ token: string; user: User }>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string } | null>;
  hashPassword(password: string): Promise<string>;
  googleSignupUseCase(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  resetPassword(email: string, password: string): Promise<User | null>;
  resendOtp(email: string): Promise<boolean>;
  blockUser(email: string): Promise<User>;
  unblockUser(email: string): Promise<User>;
  changeUserRole(email: string): Promise<User | null>;
}
