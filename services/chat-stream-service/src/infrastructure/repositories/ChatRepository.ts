import { IChatRepository } from '../../domain/repositories/IChatRepository';
import { Message } from '../../domain/entities/message';
import { MessageModel } from '../database/models/MessageModel';

export class ChatRepository implements IChatRepository {
  async saveMessage(message: Message): Promise<Message> {
    const newMessage = new MessageModel(message);
    const savedMessage = await newMessage.save();
    return savedMessage.toObject() as Message;
  }
  async deleteMessage(messageId: string): Promise<Message> {
    try {  
      // Find the message by its ID before deleting it
      const messageToDelete = await MessageModel.findById(messageId).exec();
  
      if (!messageToDelete) {
        console.error('Message not found');
        throw new Error('Message not found');
      }
  
      // Delete the message
      await MessageModel.findByIdAndDelete(messageId).exec();
      console.log('deteled mesage',messageToDelete)
      // Return the deleted message
      return messageToDelete.toObject() as Message;
    } catch (error: any) {
      console.error('Error deleting message:', error);
      throw error;
    }
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
              senderProfile:1,
              status:1,
              text: 1,
              fileUrl: 1,
              fileType: 1,
              createdAt: 1,
            }
          }
        }
      ]);
  
      return unreadData;
    } catch (error:any) {
      console.error('Error getting unread messages:', error);
      throw error; 
    }
  }
  
}
