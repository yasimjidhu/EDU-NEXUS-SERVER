import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/entities/message';
import { MessageModel } from '../database/models/MessageModel';

export class ChatRepository implements IChatRepository {
  async saveMessage(message: Message): Promise<Message> {
    const newMessage = new MessageModel(message);
    const savedMessage = await newMessage.save();
    return savedMessage.toObject() as Message;
  }
  async updateMessageStatus(messageId: string, userId: string, status: string): Promise<Message> {
    const updateFields: any = { status };  // Always update the status
  
    // Only update the readBy array if the status is 'read'
    if (status === 'read') {
      updateFields.$addToSet = { readBy: userId };
    }
  
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      updateFields,
      { new: true }
    ).exec();

    console.log('updated message status',updatedMessage)
  
    return updatedMessage!.toObject();
  }
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const messages = await MessageModel.find({ conversationId })
      .sort({ timestamp: 1 })
      .exec();
    return messages.map((message: any) => message.toObject() as Message);
  }
  async getMessagedStudentsIds(instructorId: string): Promise<string[]> {
    const messagedStudentsIds = await MessageModel.distinct('senderId', { conversationId: new RegExp(instructorId) })
    console.log('messaged students id got from db', messagedStudentsIds)
    return messagedStudentsIds
  }
  async getGroupMessages(groupId: string): Promise<Message[]> {
    const messages = await MessageModel.aggregate([
      {
        $match: {
          conversationId: groupId,
          isGroup: true
        },
      },
      {
        $sort: { createdAt: 1 },
      }
    ])
    return messages
  }
  async getUnreadMessages(userId: string): Promise<any> {
    try {
      const unreadData = await MessageModel.aggregate([
        {
          $match: {
            status: { $ne: 'read' },
            senderId: { $ne: userId }
          },
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: '$conversationId',
            unreadCount: { $sum: 1 },
            latestMessage: { $first: '$$ROOT' },
          },
        },
        {
          $project: {
            conversationId: '$_id',
            unreadCount: 1,
            latestMessage: {
              _id: 1,
              senderId: 1,
              senderName: 1,
              status:1,
              text: 1,
              fileUrl: 1,
              fileType: 1,
              createdAt: 1,
            }
          }
        }
      ]);
  
      console.log('unread data is', unreadData);
      return unreadData;
    } catch (error:any) {
      console.error('Error getting unread messages:', error);
      throw error; 
    }
  }
  
}
