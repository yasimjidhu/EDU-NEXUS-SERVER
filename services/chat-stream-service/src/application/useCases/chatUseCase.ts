import { IChatService } from '../interfaces/IChatService';
import { Message } from '../../domain/entities/message';
import { TStudent } from 'src/types/student';
import { IUserServiceClient } from '@interfaces/IUserServiceClient';

export class ChatUseCase {
  constructor(
    private chatService: IChatService,
    private userServiceClient:IUserServiceClient
  ) {}

  async sendMessage(message: Message): Promise<Message> {
    return this.chatService.sendMessage(message);
  }
  async updateMessageStatus(messageId:string,status:string):Promise<Message>{
    return await this.chatService.updateMessageStatus(messageId,status)
  }
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.chatService.getMessages(conversationId);
  }
  async getMessagedStudents(instructorId:string):Promise<TStudent[]>{
    try{
      const studentsIds = await  this.chatService.getMessagedStudentsIds(instructorId)
      const students = await this.userServiceClient.getStudentByIds(studentsIds)
      return students
    }catch(error:any){
      console.error('Error fetching messaged students',error)
      throw new Error(error)
    }
  }
  async getGroupMessages(groupId: string): Promise<Message[]> {
     return await this.chatService.getGroupMessages(groupId);
  }
  async getUnreadMessages(userId:string):Promise<any>{
    return await this.chatService.getUnreadMessages(userId)
  }
}
