import { Message } from '../../domain/entities/message';

export interface IChatService {
  sendMessage(message: Message): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
  getMessagedStudentsIds(instructorId:string):Promise<string[]>;
  updateMessageStatus(messageId:string,status:string):Promise<Message>
  getGroupMessages(groupId:string):Promise<Message[]>
}
