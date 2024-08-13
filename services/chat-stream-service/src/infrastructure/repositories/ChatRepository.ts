import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/entities/message';
import { MessageModel } from '../database/models/MessageModel';

export class ChatRepository implements IChatRepository {
  async saveMessage(message: Message): Promise<Message> {
    const newMessage = new MessageModel(message);
    const savedMessage = await newMessage.save();
    console.log('new message saved',savedMessage)
    return savedMessage.toObject() as Message;
  }
  async updateMessageStatus(messageId:string,status:string):Promise<Message>{
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {$set:{status}},
      {new:true}
    ).exec();
    return updatedMessage!.toObject();
  }
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await MessageModel.find({conversationId})
      .sort({ timestamp: 1 })
      .exec();
    return messages.map((message:any) => message.toObject() as Message);
  }

  async getMessagedStudentsIds(instructorId:string):Promise<string[]>{
    const messagedStudentsIds = await MessageModel.distinct('senderId',{conversationId:new RegExp(instructorId)})
    return messagedStudentsIds
  }
  async getGroupMessages(groupId:string):Promise<Message[]>{
    console.log('group messages called in backend and id got',groupId)
    const messages = await MessageModel.aggregate([
      {
        $match:{
          conversationId:groupId,
          isGroup:true
        },
      },
      {
        $sort:{createdAt:1},
      }
    ])
    console.log('group messages',messages)
    return messages
  }
}
