import { UserEntity } from "../../domain/entities/user";

export interface UserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  approve(email: string): Promise<UserEntity | null>
  reject(email: string): Promise<UserEntity | null>
  findAllInstructors(): Promise<UserEntity[]>
  findInstructors(instructorsId: string[]): Promise<UserEntity[] | null>
  findStudentsByIds(studentsIds: string[]): Promise<UserEntity[] | null>;
  findAllUsers(): Promise<UserEntity[]>
  blockUser(email: string): Promise<UserEntity | null>
  unBlockUser(email: string): Promise<UserEntity | null>
  getVerifiedInstructors(): Promise<UserEntity[]>
  getUnVerifiedInstructors(): Promise<UserEntity[]>
  updateUserDetails(email: string, data: Partial<UserEntity>): Promise<UserEntity | null>
} 
