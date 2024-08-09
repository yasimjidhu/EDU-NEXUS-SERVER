import { Kafka,  EachMessagePayload } from 'kafkajs';
import { SignupUseCase } from '@usecases/authUseCase';
import { UserRepositoryImpl } from '@repositories/userRepository';
import {GenerateOtp} from "@usecases/generateOtpUseCase"
import EmailService from '@services/emailService';
import { OTPRepositoryImpl } from '@repositories/OTPRepository.impl';
import RedisClient from '@database/redis-client';
import { AuthService } from '@services/AuthService';
import { TokenRepository } from '@repositories/tokenRepository';


const kafka = new Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'auth-service-group' });

const userRepository = new UserRepositoryImpl();
const otpRepository = new OTPRepositoryImpl(RedisClient);

const emailService = new EmailService();
const authService = new AuthService();
const tokenRepository = new TokenRepository();

const generateOtpUseCase = new GenerateOtp(otpRepository, emailService);
const signupUseCase = new SignupUseCase(userRepository, generateOtpUseCase, authService, tokenRepository);

export const startKafkaConsumer = async () => {
    console.log('auth-service consumer started');
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-status' });
    await consumer.subscribe({ topic: 'instructor-approval' });
    await consumer.run({
        eachMessage: async ({ topic, message }: EachMessagePayload) => {
            try {
                if(message.value){
                    const payload = JSON.parse(message.value.toString());
                    switch (topic) {
                        case 'user-status':
                            if (payload.action === 'block') {
                                await handleUserBlocked(payload);
                            } else if (payload.action === 'unblock') {
                                await handleUserUnblocked(payload);
                            }
                            break;
                        case 'instructor-approval':
                            if (payload) {
                                await handleInstructorApproval(payload);
                            }
                            break;
                        default:
                            console.warn(`Unknown topic: ${topic}`);
                            break;
                    }
                }
            } catch (error) {
                console.error(`Error processing message on topic ${topic}:`, error);
            }
        },
    });
};

const shutdown = async () => {
    try {
        console.log('Disconnecting consumer...');
        await consumer.disconnect();
        console.log('Consumer disconnected');
    } catch (error) {
        console.error('Error during shutdown', error);
    } finally {
        process.exit();
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

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

const handleInstructorApproval = async (payload: any) => {
    try {
        await signupUseCase.changeUserRole(payload.email);
        console.log(`${payload.email}'s role changed to instructor`);
    } catch (error) {
        console.error(`Error changing user role for ${payload.email}:`, error);
    }
};