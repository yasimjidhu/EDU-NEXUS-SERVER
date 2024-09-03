
import { FeedbackEntity } from "../../domain/entities/feedback";
import { UserEntity } from "../../domain/entities/user";
import { sendBlockUserMessage, sendUnblockUserMessage } from "../../infrastructure/kafka/kafkaService";
import { UserRepository } from "../../infrastructure/repositories/user";


export class ProfileUseCase{
    constructor(
        private userRepository:UserRepository){}

    async getUser(email:string):Promise<UserEntity | null>{
        const user = await this.userRepository.findByEmail(email)
        if(!user){
            console.log('user not found',user)
            return null
        }
        return user
    }
    async getAllInstructors():Promise<UserEntity[] | null>{
        const allInstructors = await this.userRepository.findAllInstructors()
        if(!allInstructors){
            return null
        }
        return allInstructors
    }
    async getStudentsByIds(students_ids:string[]):Promise<UserEntity[] | null>{
        return await this.userRepository.findStudentsByIds(students_ids)
    }
    async getEnrolledCourseInstructors(instructorsId:string[]):Promise<UserEntity[]|null>{
        return await this.userRepository.findInstructors(instructorsId)
    }
    async getVerifiedInstructors():Promise<UserEntity[] | null>{
        const verifiedInstructors = await this.userRepository.getVerifiedInstructors()
        if(!verifiedInstructors){
            return null
        }
        return verifiedInstructors
    }
    async getUnVerifiedInstructors():Promise<UserEntity[] | null>{
        const unVerifiedInstructors = await this.userRepository.getUnVerifiedInstructors()
        if(!unVerifiedInstructors){
            return null
        }
        return unVerifiedInstructors
    }
    async getAllUsers():Promise<UserEntity[] | null>{
        const allUsers = await this.userRepository.findAllUsers()
        if(!allUsers){
            return null
        }
        return allUsers
    }
    async blockUser(email:string):Promise<UserEntity | null>{
        const blockedUser = await this.userRepository.blockUser(email)
        if(!blockedUser){
            return null
        }
        await sendBlockUserMessage(email)
        return blockedUser
    }
    async unBlockUser(email:string):Promise<UserEntity | null>{
        const unBlockedUser = await this.userRepository.unBlockUser(email)
        if(!unBlockedUser){
            return null
        }
        await sendUnblockUserMessage(email)
        return unBlockedUser
    }
    async updateUserDetails(email:string,data:Partial<UserEntity>):Promise<UserEntity | null>{
        return await this.userRepository.updateUserDetails(email,data)
    }
    async submitFeedback(feedback:FeedbackEntity):Promise<FeedbackEntity|null>{
        return await this.userRepository.postFeedback(feedback)
    }
    async getFeedbacks():Promise<FeedbackEntity[]|[]>{
        return await this.userRepository.getFeedbacks()
    }
}