import { Message } from '../entities/message';

export interface IChatRepository {
  saveMessage(message: Message): Promise<Message>;
  updateMessageStatus(messageId:string,userId:string,status:string):Promise<Message>;
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  getMessagedStudentsIds(instructorId:string):Promise<string[]>;
}