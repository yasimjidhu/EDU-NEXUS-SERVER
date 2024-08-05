import { Message } from "../../domain/entities/message";
import { MessageRepository } from "../../domain/repositories/IMessageRepository";

export class MessageUseCase {
  private messageRepository: MessageRepository;

  constructor(messageRepository: MessageRepository) {
    this.messageRepository = messageRepository;
  }

  async createMessage(message: Message): Promise<Message> {
    return this.messageRepository.save(message);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.messageRepository.findByConversationId(conversationId);
  }

  async getMessageById(id: string): Promise<Message | null> {
    return this.messageRepository.findById(id);
  }
}
