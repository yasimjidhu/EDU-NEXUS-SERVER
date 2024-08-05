import { MessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message } from '../../domain/entities/message';
import { MessageModel } from '../database/models/MessageModel';

export class MessageRepositoryImpl implements MessageRepository {
  async save(message: Message): Promise<Message> {
    const createdMessage = await MessageModel.create(message);
    return createdMessage.toObject();
  }

  async findByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await MessageModel.find({ conversationId }).sort({createdAt:1}).exec();
    return messages.map(msg => msg.toObject());
  }

  async findById(id: string): Promise<Message | null> {
    const message = await MessageModel.findById(id).exec();
    return message ? message.toObject() : null;
  }
}