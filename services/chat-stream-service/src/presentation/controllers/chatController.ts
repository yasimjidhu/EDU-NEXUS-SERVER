import { Request, Response } from 'express';
import { ChatUseCase } from '../../application/useCases/chatUseCase';

export class ChatController {
  constructor(private chatUseCase: ChatUseCase) { }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {

      const message = req.body;
      const savedMessage = await this.chatUseCase.sendMessage(message);
      res.status(200).json(savedMessage);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const messages = await this.chatUseCase.getConversationMessages(conversationId);
      res.status(200).json(messages);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  }
  async getMessagedStudents(req: Request, res: Response): Promise<void> {
    try {
      const { instructorId } = req.params;
      const messagedStudents = await this.chatUseCase.getMessagedStudents(instructorId);
      res.status(200).json(messagedStudents);
    } catch (error:any) {
      res.status(500).json({ message: 'Error fetching messaged students', error });
    }
  }
  async getGroupMessages(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const messages = await this.chatUseCase.getGroupMessages(groupId);
      res.status(200).json({messages});
    } catch (error:any) {
      res.status(500).json({ message: 'Error fetching group messages', error });
    }
  }
  async getUnreadMessages(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data = await this.chatUseCase.getUnreadMessages(userId);
      res.status(200).json(data);
    } catch (error:any) {
      res.status(500).json({ message: 'Error fetching group messages', error });
    }
  }
}
