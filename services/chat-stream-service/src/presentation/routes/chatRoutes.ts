import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { ChatUseCase } from '../../application/useCases/chatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';
import { ChatService } from '../../infrastructure/services/ChatService';
import { UserServiceClient } from '../../infrastructure/grpc/client';
import { GroupRepository } from '../../infrastructure/repositories/groupRepository';
import { GroupUseCase } from '../../application/useCases/groupUseCase';
import { GroupController } from '../../presentation/controllers/groupController';

const router = Router();

// repositories
const chatRepository = new ChatRepository();
const groupRepository = new GroupRepository()

// services
const userServiceClient = new UserServiceClient()
const chatService = new ChatService(chatRepository);

// usecases
const chatUseCase = new ChatUseCase(chatService, userServiceClient);
const groupUseCase = new GroupUseCase(groupRepository)

// controllers
const chatController = new ChatController(chatUseCase);
const groupController = new GroupController(groupUseCase)

// messages related routes
router.post('/message', chatController.sendMessage.bind(chatController));
router.get('/messages/:conversationId', chatController.getMessages.bind(chatController));
router.get('/messaged-students/:instructorId', chatController.getMessagedStudents.bind(chatController))
router.get('/group-messages/:groupId',chatController.getGroupMessages.bind(chatController))

// group related routes
router.post('/group', groupController.createGroup.bind(groupController))
router.post('/group/join', groupController.joinGroup.bind(groupController))
router.delete('/group/leave', groupController.leaveGroup.bind(groupController))
router.get('/group/:groupId', groupController.getGroup.bind(groupController))
router.get('/joined-groups/:userId', groupController.getUserJoinedGroups.bind(groupController))
router.post('/addToGroup/:groupId', groupController.addUsersToGroup.bind(groupController))
router.delete('/removeFromGroup/:groupId', groupController.addUsersToGroup.bind(groupController))

export default router;
