import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/entities/message';
import { MessageModel } from '../database/models/MessageModel';

export class ChatRepository implements IChatRepository {
  async saveMessage(message: Message): Promise<Message> {
    const newMessage = new MessageModel(message);
    const savedMessage = await newMessage.save();
    return savedMessage.toObject() as Message;
  }
  async updateMessageStatus(messageId:string,status:string):Promise<Message>{
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {$set:{status}},
      {new:true}
    ).exec();
    console.log('updated message',updatedMessage)
    return updatedMessage!.toObject();
  }
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await MessageModel.find({conversationId})
      .sort({ timestamp: 1 })
      .exec();
    return messages.map((message) => message.toObject() as Message);
  }

  async getMessagedStudentsIds(instructorId:string):Promise<string[]>{
    const messagedStudentsIds = await MessageModel.distinct('senderId',{conversationId:new RegExp(instructorId)})
    return messagedStudentsIds
  }
}
