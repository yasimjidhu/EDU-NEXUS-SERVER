import { UserRepository } from "./user";
import { UserEntity } from "../../domain/entities/user";
import { User } from "../database/models/User";
import mongoose, { mongo } from "mongoose";
import { FeedbackEntity } from "../../domain/entities/feedback";
import { Feedback } from "../database/models/feedbacks";

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

  async update(instructor: UserEntity): Promise<void> {
    const existingInstructor = await User.findById(instructor._id);
    if (existingInstructor) {
      existingInstructor.isVerified = instructor.isVerified;
      existingInstructor.verificationSessionId = instructor.verificationSessionId;
      existingInstructor.verificationStatus = instructor.verificationStatus;
      await existingInstructor.save();
    } else {
      const newInstructor = new User({
        _id: instructor._id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        isVerified: instructor.isVerified,
        verificationSessionId: instructor.verificationSessionId,
        verificationStatus: instructor.verificationStatus,
      });
      await newInstructor.save();
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

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await User.findById(id).exec();
      return user ? (user.toObject() as UserEntity) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user by id: ${error.message}`);
    }
  }

  async findByVerificationSessionId(sessionId: string): Promise<UserEntity | null> {
    const instructor = await User.findOne({ verificationSessionId: sessionId })
    return instructor.toObject() as UserEntity
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

  // Method to save the Stripe account ID for an instructor
  async saveStripeAccountId(instructorId: string, stripeAccountId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(
        instructorId,
        { stripeAccountId: stripeAccountId },
        { new: true, useFindAndModify: false }
      );
      console.log(`Stripe account ID saved for instructor ${instructorId}`);
    } catch (error) {
      console.error('Error saving Stripe account ID:', error);
      throw new Error('Failed to save Stripe account ID');
    }
  }

  // Optional: Retrieve instructor's Stripe account ID
  async getStripeAccountId(instructorId: string): Promise<string | null> {
    try {
      const user = await User.findById(instructorId);
      return user?.stripeAccountId || null;
    } catch (error) {
      console.error('Error retrieving Stripe account ID:', error);
      throw new Error('Failed to retrieve Stripe account ID');
    }
  }

  async findAllInstructors(): Promise<UserEntity[]> {
    try {
      const allInstructors = await User.find({
        role: "instructor",
        isVerified: true,
        isRejected: false,
      }).exec();
      return allInstructors.map(
        (instructor) => instructor.toObject() as UserEntity
      );
    } catch (error: any) {
      throw new Error(`Failed to find all instructors: ${error.message}`);
    }
  }
  async findInstructors(instructorsId: string[]): Promise<UserEntity[] | null> {
    try {
      const objectIds = instructorsId.map(id => new mongoose.Types.ObjectId(id))

      const allInstructors = await User.find({
        _id: { $in: objectIds },
        role: "instructor",
        isVerified: true,
        isRejected: false,
      }).exec();
      console.log('this is the fetched instructors data of student enrolled courses', allInstructors)
      return allInstructors.map(
        (instructor) => instructor.toObject() as UserEntity
      );
    } catch (error: any) {
      throw new Error(`Failed to find all instructors: ${error.message}`);
    }
  }
  async findStudentsByIds(studentsIds: string[]): Promise<UserEntity[] | null> {
    try {
      const objectIds = studentsIds.map(id => new mongoose.Types.ObjectId(id))

      const students = await User.find({
        _id: { $in: objectIds },
        role: 'student',
        isVerified: true,
        isRejected: false
      }).exec()
      console.log('this is the fetched students data ', students)
      return students.map((student) => student.toObject() as UserEntity)
    } catch (error: any) {
      console.log(error)
      throw new Error(`Failed to find students data: ${error.message}`);
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
  async blockUser(email: string): Promise<UserEntity | null> {
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

  async unBlockUser(email: string): Promise<UserEntity | null> {
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
  async updateUserDetails(email: string, updateData: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      console.log('update user detials reafhed in server', updateData)
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        { $set: updateData },
        { new: true }
      );
      console.log('updated use in backend', updatedUser)
      return updatedUser ? (updatedUser.toObject() as UserEntity) : null;
    } catch (error: any) {
      console.error('Error updating user details:', error);
      throw new Error(`Failed to update user details: ${error.message}`);
    }
  }

  async updateInstructorAccountStatus(accountId: string, chargesEnabled: boolean): Promise<void> {
    try {
      // Example: Update the instructor status in MongoDB
      const updateResult = await User.updateOne(
        { stripeAccountId: accountId },
        { $set: { chargesEnabled: chargesEnabled, onboardingComplete: true } }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('Instructor account updated successfully in the database.');
      } else {
        console.log('Failed to update instructor account status in the database.');
      }
    } catch (error) {
      console.error('Error updating instructor account status:', error);
      throw new Error('Failed to update the database');
    }
  }
  async updatePaymentStatus(stripeAccountId: string, chargesEnabled: boolean): Promise<string> {
    try {
      const result = await User.updateOne(
        { stripeAccountId },
        { $set: { chargesEnabled, onboardingComplete: true } }
      );

      if (result.modifiedCount > 0) {
        return 'Instructor status updated';
      } else {
        return 'Failed to update instructor status';
      }
    } catch (error) {
      console.error('Error updating instructor:', error);
      throw new Error('Error updating instructor status'); // Rethrow the error for further handling
    }
  }


  async postFeedback(feedback: FeedbackEntity): Promise<FeedbackEntity | null> {
    try {
      console.log('Saving feedback details in the server:', feedback);

      const feedbackInstance = new Feedback(feedback);
      const savedFeedback = await feedbackInstance.save();

      return savedFeedback ? (savedFeedback.toObject() as FeedbackEntity) : null;
    } catch (error: any) {
      console.error('Error saving feedback details:', error);
      throw new Error(`Failed to save feedback details: ${error.message}`);
    }
  }
  async getFeedbacks(): Promise<FeedbackEntity[] | []> {
    try {
      const feedbacks = await Feedback.find()
      console.log('all feedbacks', feedbacks)
      return feedbacks.map((feedback) => feedback.toObject() as FeedbackEntity);
    } catch (error: any) {
      console.error('Error saving feedback details:', error);
      throw new Error(`Failed to save feedback details: ${error.message}`);
    }
  }


}
