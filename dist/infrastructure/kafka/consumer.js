"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKafkaConsumer = void 0;
const kafkajs_1 = require("kafkajs");
const authUseCase_1 = require("../../application/use-cases/authUseCase");
const userRepository_1 = require("../repositories/userRepository");
const generateOtpUseCase_1 = __importDefault(require("../../application/use-cases/otp/generateOtpUseCase"));
const emailService_1 = __importDefault(require("../../presentation/services/emailService"));
const OTPRepository_impl_1 = require("../repositories/OTPRepository.impl");
const redic_client_1 = __importDefault(require("../database/redic-client"));
const AuthService_1 = require("../../adapters/services/AuthService");
const tokenRepository_1 = require("../repositories/tokenRepository");
const kafka = new kafkajs_1.Kafka({
    clientId: 'auth-service',
    brokers: ['localhost:9092'],
});
const consumer = kafka.consumer({ groupId: 'auth-service-group' });
const userRepository = new userRepository_1.UserRepositoryImpl();
const otpRepository = new OTPRepository_impl_1.OTPRepositoryImpl(redic_client_1.default);
const emailService = new emailService_1.default();
const authService = new AuthService_1.AuthService();
const tokenRepository = new tokenRepository_1.TokenRepository();
const generateOtpUseCase = new generateOtpUseCase_1.default(otpRepository, emailService);
const signupUseCase = new authUseCase_1.SignupUseCase(userRepository, generateOtpUseCase, authService, tokenRepository);
const startKafkaConsumer = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('auth-service consumer started');
    yield consumer.connect();
    yield consumer.subscribe({ topic: 'user-status' });
    yield consumer.subscribe({ topic: 'instructor-approval' });
    yield consumer.run({
        eachMessage: (_a) => __awaiter(void 0, [_a], void 0, function* ({ topic, message }) {
            try {
                if (message.value) {
                    const payload = JSON.parse(message.value.toString());
                    switch (topic) {
                        case 'user-status':
                            if (payload.action === 'block') {
                                yield handleUserBlocked(payload);
                            }
                            else if (payload.action === 'unblock') {
                                yield handleUserUnblocked(payload);
                            }
                            break;
                        case 'instructor-approval':
                            if (payload) {
                                yield handleInstructorApproval(payload);
                            }
                            break;
                        default:
                            console.warn(`Unknown topic: ${topic}`);
                            break;
                    }
                }
            }
            catch (error) {
                console.error(`Error processing message on topic ${topic}:`, error);
            }
        }),
    });
});
exports.startKafkaConsumer = startKafkaConsumer;
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Disconnecting consumer...');
        yield consumer.disconnect();
        console.log('Consumer disconnected');
    }
    catch (error) {
        console.error('Error during shutdown', error);
    }
    finally {
        process.exit();
    }
});
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
const handleUserBlocked = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield signupUseCase.blockUser(payload.email);
        console.log(`User blocked successfully: ${payload.email}`);
    }
    catch (error) {
        console.error(`Error blocking user ${payload.email}:`, error);
    }
});
const handleUserUnblocked = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield signupUseCase.unblockUser(payload.email);
        console.log(`User unblocked successfully: ${payload.email}`);
    }
    catch (error) {
        console.error(`Error unblocking user ${payload.email}:`, error);
    }
});
const handleInstructorApproval = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield signupUseCase.changeUserRole(payload.email);
        console.log(`${payload.email}'s role changed to instructor`);
    }
    catch (error) {
        console.error(`Error changing user role for ${payload.email}:`, error);
    }
});
