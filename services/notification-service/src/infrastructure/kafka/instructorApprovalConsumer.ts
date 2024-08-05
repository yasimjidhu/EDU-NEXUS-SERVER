import { Kafka, KafkaMessage } from "kafkajs";
import { EmailService } from "../services/emailService";

const kafka = new Kafka({
    clientId: 'user-service',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-group' });
const emailService = new EmailService();

export const run = async () => {
    try {
        console.log('Connecting consumer...');
        await consumer.connect();
        console.log('Consumer connected');
        
        console.log('Subscribing to topic...');
        await consumer.subscribe({ topic: 'instructor-approval', fromBeginning: true });
        console.log('Subscribed to topic');
        
        console.log('Starting consumer run...');
        await consumer.run({
            eachMessage: async ({ topic, partition, message }: { topic: string, partition: number, message: KafkaMessage }) => {
                try {
                    const { email,courseName, action } = JSON.parse(message.value?.toString() ?? '{}');
                    console.log('Received message:', email, 'Action:', action);

                    if (action === 'approve') {
                        await emailService.sendCourseApprovalEmail(email,courseName);
                        console.log('Approval email sent as notification:', email);
                    } else if (action === 'reject') {
                        await emailService.sendCourseRejectionEmail(email,courseName);
                        console.log('Rejection email sent as notification:', email);
                    } else {
                        console.warn('Unknown action received:', action);
                    }

                    await consumer.commitOffsets([{ topic, partition, offset: (parseInt(message.offset) + 1).toString() }]);
                } catch (error) {
                    console.error('Error processing message', error);
                }
            }
        });
        console.log('Consumer run started');
    } catch (error) {
        console.error('Error in consumer setup', error);
    }
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
