import { Message } from '../../domain/entities/message';

export interface IChatService {
  sendMessage(message: Message): Promise<Message>;
  deleteMessage(messageId:string):Promise<Message>
  getMessages(conversationId: string): Promise<Message[]>;
  getMessagedStudentsIds(instructorId:string):Promise<string[]>;
  updateMessageStatus(messageId:string,userId:string,status:string):Promise<Message>
  getGroupMessages(groupId:string):Promise<Message[]>
  getUnreadMessages(userId:string):Promise<any>
}
