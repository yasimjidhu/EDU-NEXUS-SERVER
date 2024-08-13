import { Message } from '../../domain/entities/message';
import { IChatService } from '../../application/interfaces/IChatService';
import { ChatRepository } from '../repositories/ChatRepository';

export class ChatService implements IChatService {
  constructor(private chatRepository: ChatRepository) {}

  async saveMessage(message: Message): Promise<Message> {
    return this.chatRepository.saveMessage(message);
  }
  async sendMessage(message: Message): Promise<Message> {
    return this.chatRepository.saveMessage(message);
  }
  async updateMessageStatus(messageId:string,status:string):Promise<Message>{
    return await this.chatRepository.updateMessageStatus(messageId,status)
  }
  async getMessages(conversationId: string): Promise<Message[]> {
    return this.chatRepository.getMessagesByConversationId(conversationId);
  }
  async getMessagedStudentsIds(instructorId:string):Promise<string[]>{
    return this.chatRepository.getMessagedStudentsIds(instructorId)
  }
  async getGroupMessages(groupId:string):Promise<Message[]>{
    return await  this.chatRepository.getGroupMessages(groupId)
  }
}
