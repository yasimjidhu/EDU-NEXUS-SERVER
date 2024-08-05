import { Request, Response } from 'express';
import { MessageUseCase } from '../../application/useCases/messageUseCase';

export class MessageController {
  private messageUseCase: MessageUseCase;

  constructor(messageUseCase: MessageUseCase) {
    this.messageUseCase = messageUseCase;
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const message = await this.messageUseCase.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getMessagesByConversation(req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.messageUseCase.getMessagesByConversation(
        req.params.conversationId,
      );
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const message = await this.messageUseCase.getMessageById(req.params.id);
      if (message) {
        res.status(200).json(message);
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
