import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { ChatUseCase } from '../../application/useCases/chatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';
import { ChatService } from '../../infrastructure/services/ChatService';
import { UserServiceClient } from '../../infrastructure/grpc/client';

const router = Router();

const chatRepository = new ChatRepository();
const userServiceClient = new UserServiceClient()

const chatService = new ChatService(chatRepository);
const chatUseCase = new ChatUseCase(chatService,userServiceClient);
const chatController = new ChatController(chatUseCase);

router.post('/message', chatController.sendMessage.bind(chatController));
router.get('/messages/:conversationId',chatController.getMessages.bind(chatController));
router.get('/messaged-students/:instructorId', chatController.getMessagedStudents.bind(chatController))

export default router;
