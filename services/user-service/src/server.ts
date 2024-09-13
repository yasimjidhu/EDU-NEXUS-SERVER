import express from "express";
import axios from 'axios'
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser'
import connectDB from "./infrastructure/database/config";
import userRouter from './presentation/http/routes/userRoutes'
import webhookRouter from './presentation/http/routes/webhookRoute'
import { UserRepositoryImpl } from "./infrastructure/repositories/UserImpl";
import { ProfileUseCase } from "./application/use-case/ProfileUseCase";
import { GrpcServer } from "./infrastructure/grpc/server";
import startConsumer from "./infrastructure/kafka/consumer";

dotenv.config();

const app = express();

app.use('/webhook', bodyParser.raw({ type: 'application/json' }), webhookRouter)

app.use(cookieParser())

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

axios.defaults.withCredentials = true;

app.use("/user", userRouter);

// Setup server
const startServer = async () => {
  try {
    await connectDB()
    await startConsumer()
    const HTTP_PORT = process.env.HTTP_PORT || 3008
    app.listen(HTTP_PORT, () => {
      console.log(`User Service running on port ${HTTP_PORT}`)
    })

    // setup gRPC server
    const userRepository = new UserRepositoryImpl()
    const userUseCase = new ProfileUseCase(userRepository)
    const GRPC_PORT = process.env.GRPC_PORT || 50052
    const grpcServer = new GrpcServer(userUseCase)
    grpcServer.start(Number(GRPC_PORT))
    console.log('grpc server running')
  } catch (error: any) {
    console.error('Error occured while starting the server:', error)
    process.exit(1)
  }
}

startServer()