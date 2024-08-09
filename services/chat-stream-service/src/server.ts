import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import router from './presentation/routes/chatRoutes';
import connectDB from './infrastructure/database/chatDb';
import { verifyAccessToken } from './presentation/middlewares/authMiddleware';
import { ChatUseCase} from './application/useCases/chatUseCase'
import { ChatService } from './infrastructure/services/ChatService';
import { UserServiceClient } from './infrastructure/grpc/client';
import { ChatRepository } from './infrastructure/repositories/ChatRepository';

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

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

io.use((socket: Socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('no token')
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = verifyAccessToken(token);
    (socket as any).decoded = decoded; 
    console.log('decoded user',decoded)
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

let onlineUsers: { [key: string]: boolean } = {};

io.on('connection', (socket: Socket) => {
  const decodedUser = (socket as any).decoded;
  const email = decodedUser.email

  // Mark as online
  onlineUsers[email] = true;
  io.emit('userStatus',{email,status:'online'})
  console.log('a user connected',email);

  socket.on('disconnect', () => {
    
    // Mark as offline
    delete onlineUsers[email];
    io.emit('userStatus',{email,status:'offline'});
    console.log('user disconnected',email);
  });

  socket.on('join', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room ${conversationId}`);
  });

  socket.on('leave', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left room ${conversationId}`);
  });

  socket.on('message', (message) => {
    console.log(`Message received from ${message.senderId}:`, message);
    const { conversationId } = message;
    io.to(conversationId).emit('message', message);
    console.log(`Message sent to room ${conversationId}:`, message);
  });

  socket.on('messageDelivered',async(messageId)=>{
    // update message status to delivered
    try{
      const updatedMessage = await chatUseCase.updateMessageStatus(messageId,'delivered')
      io.to(updatedMessage.conversationId).emit('messageStatusUpdated', updatedMessage);
    }catch(error:any){
      console.error('Error updating message status to delivered',error)
    }
  })

  socket.on('messageRead',async(messageId)=>{
    // updated message status to read
    try {
      const updatedMessage = await chatUseCase.updateMessageStatus(messageId,'read')
      io.to(updatedMessage.conversationId).emit('messageStatusUpdated', updatedMessage);
    } catch (error:any) {
      console.error('Error updating message status to delivered',error)
    }
  })
 
  socket.on('typing', (data) => {
    console.log('user typing', data);
    const { conversationId, userId, isTyping } = data;
    socket.to(conversationId).emit('typing', { userId, isTyping });
  });
});

const PORT = 3006;

connectDB().then(() => {
  console.log('chat and stream db connected successfully');
  server.listen(PORT, () => {
    console.log(`chat server running on port ${PORT}`);
  });
});
