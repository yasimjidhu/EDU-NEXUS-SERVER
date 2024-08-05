import { Message } from '../entities/message';

export interface MessageRepository {
  save(message: Message): Promise<Message>;
  findByConversationId(conversationId: string): Promise<Message[]>;
  findById(id: string): Promise<Message | null>;
}