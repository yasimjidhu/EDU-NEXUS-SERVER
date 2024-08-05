import { UserEntity } from "../../domain/entities/user";
import { sendInstructorApprovalMessage } from "../../infrastructure/kafka/kafkaProducer";
import { UserRepository } from "../../infrastructure/repositories/user";

export class AuthorizeUserUseCase{
    constructor(private userRepository:UserRepository){}

    async approveInstructor(email:string):Promise<UserEntity>{
        const approvedUser = await this.userRepository.approve(email)
        
        if(!approvedUser){
            throw new Error('User not found or could not be approved')
        }

        await sendInstructorApprovalMessage(email, "approve");
        
        return approvedUser
    }
    async rejectInstructor(email:string):Promise<UserEntity>{
        const rejectedUser = await this.userRepository.reject(email)

        if(!rejectedUser){
            throw new Error('User not found or could not be rejected')
        }

        await sendInstructorApprovalMessage(email, "reject");
        return rejectedUser
    }
}