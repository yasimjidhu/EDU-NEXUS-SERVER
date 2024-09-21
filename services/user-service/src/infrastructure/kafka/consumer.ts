import { Kafka, EachMessagePayload } from 'kafkajs';
import { ProfileUseCase } from '../../application/use-case/ProfileUseCase';
import { UserRepositoryImpl } from '../repositories/UserImpl';

class KafkaConsumer {
    private userUseCase: ProfileUseCase;
    private consumer: any;

    constructor(userUseCase: ProfileUseCase) {
        this.userUseCase = userUseCase;
        this.consumer = this.createConsumer();
    }

    createConsumer() {
        const kafka = new Kafka({
            clientId: 'user-service-client',
            brokers: ['cluster_0.confluent.cloud:9092'],
            ssl: true,
            sasl: {
              mechanism: 'plain', 
              username: process.env.KAFKA_API_KEY || '',
              password: process.env.KAFKA_SECRET || '',
            },
          });
        return kafka.consumer({ groupId: 'user-service-group' });
    }

    async connect() {
        await this.consumer.connect();
    }

    async disconnect() {
        await this.consumer.disconnect();
    }

    async subscribeToTopics(topics: string[]) {
        await this.consumer.subscribe({ topics, fromBeginning: false });
    }

    async run() {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                const receivedMessage = JSON.parse(message.value?.toString() || '{}');
                console.log(`Received message from ${topic}:`, receivedMessage);

                if (topic === 'instructor-status-updates') {
                    await this.handleInstructorStatusUpdate(receivedMessage);
                }
            },
        });
    }

    // Handler method to update instructor status
    async handleInstructorStatusUpdate(message: any) {
        const { stripeAccountId, chargesEnabled } = message;

        try {
            if (chargesEnabled) {
                console.log(`Instructor ${stripeAccountId} can now receive payments.`);
                // Use the use case to enable instructor features
                await this.userUseCase.updatePaymentStatus(stripeAccountId,chargesEnabled);
            } else {
                console.log(`Instructor ${stripeAccountId} is not yet approved for payments.`);
                // Use the use case to set instructor under review
                await this.userUseCase.updatePaymentStatus(stripeAccountId,chargesEnabled);
            }
        } catch (error) {
            console.error(`Error handling instructor status update: ${error.message}`);
        }
    }
}

// Example startup logic
async function startConsumer() {
    const userRepository = new UserRepositoryImpl();
    const userUseCase = new ProfileUseCase(userRepository);

    const kafkaConsumer = new KafkaConsumer(userUseCase);

    try {
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribeToTopics(['instructor-status-updates']);
        await kafkaConsumer.run();
        console.log('Kafka consumer is running and listening to instructor-status-updates topic');
    } catch (error) {
        console.error('Error starting Kafka consumer:', error);
    }
}

export default startConsumer
