import { UserRepository } from "./user";
import { UserEntity } from "../../domain/entities/user";
import { User } from "../database/models/User";
import mongoose from "mongoose";

export class UserRepositoryImpl implements UserRepository {
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const newUser = new User(user);
      await newUser.save();
      return newUser.toObject() as UserEntity;
    } catch (error: any) {
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await User.findOne({ email }).exec();
      return user ? (user.toObject() as UserEntity) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }

  async approve(email: string): Promise<UserEntity | null> {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { isVerified: true } },
        { new: true }
      );
      return updatedUser ? (updatedUser.toObject() as UserEntity) : null;
    } catch (error: any) {
      throw new Error(`Failed to approve user: ${error.message}`);
    }
  }

  async reject(email: string): Promise<UserEntity | null> {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { isRejected: true } },
        { new: true }
      );
      return updatedUser ? (updatedUser.toObject() as UserEntity) : null;
    } catch (error: any) {
      throw new Error(`Failed to reject user: ${error.message}`);
    }
  }

  async findAllInstructors(): Promise<UserEntity[]> {
    try {
      const allInstructors = await User.find({
        role: "instructor",
        isVerified: false,
        isRejected: false,
      }).exec();
      return allInstructors.map(
        (instructor) => instructor.toObject() as UserEntity
      );
    } catch (error: any) {
      throw new Error(`Failed to find all instructors: ${error.message}`);
    }
  }
  async findInstructors(instructorsId:string[]): Promise<UserEntity[] | null> {
    try {
      const objectIds = instructorsId.map(id => new mongoose.Types.ObjectId(id))
    
      const allInstructors = await User.find({
        _id:{$in:objectIds},
        role: "instructor",
        isVerified: true,
        isRejected: false,
      }).exec();
      console.log('this is the fetched instructors data of student enrolled courses',allInstructors)
      return allInstructors.map(
        (instructor) => instructor.toObject() as UserEntity
      );
    } catch (error: any) {
      throw new Error(`Failed to find all instructors: ${error.message}`);
    }
  }
  async findStudentsByIds(studentsIds:string[]):Promise<UserEntity[]|null>{
    try{
      const objectIds = studentsIds.map(id => new mongoose.Types.ObjectId(id))

      const students = await User.find({
        _id:{$in:objectIds},
        role:'student',
        isVerified:true,
        isRejected:false
      }).exec()
      console.log('this is the fetched students data ',students)
      return students.map((student)=>student.toObject() as UserEntity)
    }catch(error:any){
      throw new Error(`Failed to find students data: ${error.message}`);
      console.log(error)
    }
  }
  async getVerifiedInstructors(): Promise<UserEntity[]> {
      try {
        const verifiedInstructors = await User.find({
          role: "instructor",
          isVerified: true,
          isRejected: false,
        }).exec();
        return verifiedInstructors.map(
          (instructor) => instructor.toObject() as UserEntity
        );
      } catch (error: any) {
        throw new Error(`Failed to find all instructors: ${error.message}`);
      }
    }
    async getUnVerifiedInstructors(): Promise<UserEntity[]> {
      try {
        const unVerifiedInstructors = await User.find({
          role: "instructor",
          isVerified: false,
          isRejected: false,
        }).exec();
        return unVerifiedInstructors.map(
          (instructor) => instructor.toObject() as UserEntity
        );
      } catch (error: any) {
        throw new Error(`Failed to find all instructors: ${error.message}`);
      }
    }

  async findAllUsers(): Promise<UserEntity[]> {
    try {
      const allUsers = await User.find({
        isRejected: false,
        isVerified: true,
      }).exec();
      return allUsers.map((user) => user.toObject() as UserEntity);
    } catch (error: any) {
      throw new Error(`Failed to find all users: ${error.message}`);
    }
  }
  async  blockUser(email: string): Promise<UserEntity | null> {
    try {
      const blockedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { isBlocked: true } },
        { new: true } 
      );
    
      return blockedUser ? (blockedUser.toObject() as UserEntity) : null;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Failed to block the user: ${error.message}`);
    }
  }
  
  async  unBlockUser(email: string): Promise<UserEntity | null> {
    try {
      const unblockedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: { isBlocked: false } },
        { new: true } 
      );
      return unblockedUser ? (unblockedUser.toObject() as UserEntity) : null;
    } catch (error: any) {
      console.error(error);
      throw new Error(`Failed to unblock the user: ${error.message}`);
    }
  }
}
