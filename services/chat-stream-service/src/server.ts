import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import router from './presentation/routes/chatRoutes';
import connectDB from './infrastructure/database/chatDb';
import { verifyAccessToken } from './presentation/middlewares/authMiddleware';
import { ChatUseCase } from './application/useCases/chatUseCase'
import { ChatService } from './infrastructure/services/ChatService';
import { UserServiceClient } from './infrastructure/grpc/client';
import { ChatRepository } from './infrastructure/repositories/ChatRepository';
import { Message } from '@entities/message';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  },
});

app.use('/chat', router);


// setup dependencies
const chatRepository = new ChatRepository()
const chatService = new ChatService(chatRepository);
const userServiceClient = new UserServiceClient();
const chatUseCase = new ChatUseCase(chatService, userServiceClient);

io.use((socket: Socket, next: (err?: any) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('no token')
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = verifyAccessToken(token);
    (socket as any).decoded = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

let onlineUsers: { [key: string]: boolean } = {};

io.on('connection', (socket: Socket) => {
  const decodedUser = (socket as any).decoded;
  const email = decodedUser.email

  // join room based user's unique identifiers
  const userRoom = `user-${email}`;
  socket.join(userRoom)
  console.log(`User ${email} joined room ${userRoom}`)

  // Mark as online
  onlineUsers[email] = true;
  io.emit('userStatus', { email, status: 'online' })
  console.log('a user connected', email);

  socket.on('disconnect', () => {

    // Mark as offline
    delete onlineUsers[email];
    io.emit('userStatus', { email, status: 'offline' });
    console.log('user disconnected', email);
  });

  socket.on('join', (conversationId: string) => {
    if (!socket.rooms.has(conversationId)) {
      socket.join(conversationId);
      console.log(`User joined room ${conversationId}`);
    }
  });

  socket.on('leave', (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User left room ${conversationId}`);
  });

  socket.on('message', (message: Message) => {
    const { conversationId, recipientEmail } = message;

    socket.broadcast.to(conversationId).emit('message', message)

    // emit a notification to the recipient's user specific unread count
    const recipientRoom = `user-${recipientEmail}`;
    io.to(recipientRoom).emit('newMessage', message)
  });

  socket.on('deleteMessage', async ({ messageId }) => {
    try {
      const deletedMessage = await chatUseCase.deleteMessage(messageId);
      console.log('delte message in server', deletedMessage)
      if (deletedMessage) {
        io.to(deletedMessage.conversationId).emit('messageDeleted', deletedMessage);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  });


  socket.on('messageDelivered', async ({ messageId, userId }: { messageId: string, userId: string }) => {
    try {
      const updatedMessage = await chatUseCase.updateMessageStatus(messageId, userId, 'delivered')
      io.to(updatedMessage.conversationId).emit('messageStatusUpdated', updatedMessage);
    } catch (error: any) {
      console.error('Error updating message status to delivered', error)
    }
  })

  socket.on('messageRead', async ({ messageId, userId }: { messageId: string, userId: string }) => {
    try {
      const updatedMessage = await chatUseCase.updateMessageStatus(messageId, userId, 'read')
      io.to(updatedMessage.conversationId).emit('messageStatusUpdated', updatedMessage);
    } catch (error: any) {
      console.error('Error updating message status to delivered', error)
    }
  })

  socket.on('typing', (data: { conversationId: string, userId: string, isTyping: boolean }) => {
    const { conversationId, userId, isTyping } = data;
    socket.to(conversationId).emit('typing', { userId, isTyping });
  });

  socket.on('joinGroup', (groupId: string) => {
    socket.join(groupId)
  })

  socket.on('leaveGroup', (groupId: string, userId: string, userName: string) => {
    socket.leave(groupId)
    io.to(groupId).emit('userLeft', userName)
  })

  socket.on('groupMessage', (groupId: string, message: Message) => {
    io.to(groupId).emit('groupMessage', message)
  })
});

const PORT = 3006;

connectDB().then(() => {
  console.log('chat and stream db connected successfully');
  server.listen(PORT, () => {
    console.log(`chat server running on port ${PORT}`);
  });
});
