import express from 'express';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { SignupUseCase } from '../../application/use-cases/authUseCase';
import { UserRepositoryImpl } from '../repositories/userRepository'; // Adjust UserRepositoryImpl and UserDocument as per your actual implementation
import GenerateOtp from '../../application/use-cases/otp/generateOtpUseCase';
import EmailService from '../../presentation/services/emailService';
import { OTPRepositoryImpl } from '../repositories/OTPRepository.impl';
import RedisClient from '../database/redic-client';
import { AuthService } from '../../adapters/services/AuthService';
import { TokenRepository } from '../repositories/tokenRepository';

const app = express();
const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'auth-service-group' });

const userRepository = new UserRepositoryImpl();
const otpRepository = new OTPRepositoryImpl(RedisClient);

const emailService = new EmailService();
const authService = new AuthService()
const tokenRepository = new TokenRepository()

const generateOtpUseCase = new GenerateOtp(otpRepository, emailService);
const signupUseCase = new SignupUseCase(userRepository, generateOtpUseCase,authService,tokenRepository);

export const startKafkaConsumer = async () => {
    console.log('auth-service consumer started');
    await consumer.connect();
    await consumer.subscribe({ topic: /user-(blocked|unblocked)/ });

    await consumer.run({
        eachMessage: async ({ topic, message }: EachMessagePayload) => {
            try {
                switch (topic) {
                    case 'user-blocked':
                        if (message.value) {
                            await handleUserBlocked(JSON.parse(message.value.toString()));
                        }
                        break;
                    case 'user-unblocked':
                        if (message.value) {
                            await handleUserUnblocked(JSON.parse(message.value.toString()));
                        }
                        break;
                    default:
                        console.warn(`Unknown topic: ${topic}`);
                        break;
                }
            } catch (error) {
                console.error(`Error processing message on topic ${topic}:`, error);
            }
        },
    });
};

const handleUserBlocked = async (payload: any) => {
    try {
        await signupUseCase.blockUser(payload.email);
        console.log(`User blocked successfully: ${payload.email}`);
    } catch (error) {
        console.error(`Error blocking user ${payload.email}:`, error);
    }
};

const handleUserUnblocked = async (payload: any) => {
    try {
        await signupUseCase.unblockUser(payload.email);
        console.log(`User unblocked successfully: ${payload.email}`);
    } catch (error) {
        console.error(`Error unblocking user ${payload.email}:`, error);
    }
};
