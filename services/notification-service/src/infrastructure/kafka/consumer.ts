import { Kafka, KafkaMessage, Consumer } from 'kafkajs';
import { EmailService } from '../services/emailService';

const kafka = new Kafka({
  clientId: 'content-service',
  brokers: ['localhost:9092'],
});

const emailService = new EmailService();

let courseConsumer: Consumer | null = null;
let instructorConsumer: Consumer | null = null;
let paymentConsumer:Consumer | null = null;

let courseConsumerStarted = false;
let instructorConsumerStarted = false;
let paymentConsumerStarted = false

const createConsumer = (
  groupId: string,
  topics: string[],
  messageHandler: (message: KafkaMessage) => Promise<void>
) => {
  const consumer = kafka.consumer({ groupId });

  const runConsumer = async () => {
    try {
      await consumer.connect();
      console.log(`Consumer connected for group ${groupId}`);

      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: true });
        console.log(`Consumer subscribed to topic ${topic}`);
      }

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            await messageHandler(message);
            await consumer.commitOffsets([
              { topic, partition, offset: (parseInt(message.offset) + 1).toString() },
            ]);
          } catch (error) {
            console.error('Error processing message', error);
          }
        },
      });

      console.log(`Consumer running for group ${groupId}`);
      if (groupId === 'course-group') courseConsumerStarted = true;
      if (groupId === 'instructor-group') instructorConsumerStarted = true;
      if (groupId === 'payment-group') paymentConsumerStarted = true;
    } catch (error) {
      console.error(`Error in consumer setup for group ${groupId}`, error);
    }
  };

  return { runConsumer, consumer };
};

const courseApprovalMessageHandler = async (message: KafkaMessage) => {
  const { email, action, courseName } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received message', { email, action, courseName });

  if (action === 'approve') {
    await emailService.sendCourseApprovalEmail(email, courseName);
    console.log('Course approval email sent', email);
  } else if (action === 'reject') {
    await emailService.sendCourseRejectionEmail(email, courseName);
    console.log('Course rejection email sent', email);
  } else {
    console.warn('Unknown action received', action);
  }
};

const instructorApprovalMessageHandler = async (message: KafkaMessage) => {
  const { email, action } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received message', { email, action });

  if (action === 'approve') {
    await emailService.sendApprovalEmail(email);
    console.log('Instructor approval email sent', email);
  } else if (action === 'reject') {
    await emailService.sendRejectionEmail(email);
    console.log('Instructor rejection email sent', email);
  } else {
    console.warn('Unknown action received', action);
  }
};

const paymentNotificationHandler = async (message: KafkaMessage) => {
  const { type, payload } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received payment notification', { type, payload });

  if (type === 'PAYMENT_FAILURE_NOTIFICATION') {
    const { email, message, metadata } = payload;
    await emailService.sendPaymentFailureEmail(
      email,
      metadata.courseName || 'the course',
      metadata.amount,
      metadata.currency
    );
    console.log('Payment failure email sent', email);
  } else {
    console.warn('Unknown payment notification type received', type);
  }
};

const courseConsumerObj = createConsumer('course-group', ['course-approval'], courseApprovalMessageHandler);
const instructorConsumerObj = createConsumer('instructor-group', ['instructor-approval'], instructorApprovalMessageHandler);
const paymentConsumerObj = createConsumer('payment-group',['payment-events'],paymentNotificationHandler)

courseConsumer = courseConsumerObj.consumer;
instructorConsumer = instructorConsumerObj.consumer;
paymentConsumer = paymentConsumerObj.consumer;

const shutdown = async () => {
  console.log('Shutting down consumers...');
  if (courseConsumer) {
    try {
      console.log('Disconnecting course consumer...');
      await courseConsumer.disconnect();
      console.log('Course consumer disconnected');
    } catch (error) {
      console.error('Error during course consumer shutdown', error);
    }
  }
  if (instructorConsumer) {
    try {
      console.log('Disconnecting instructor consumer...');
      await instructorConsumer.disconnect();
      console.log('Instructor consumer disconnected');
    } catch (error) {
      console.error('Error during instructor consumer shutdown', error);
    }
  }
  if(paymentConsumer){
    try {
      console.log('Disconncecting payment consumer....')
      await paymentConsumer.disconnect()
      console.log('payment consumer disconnected')
    } catch (error) {
      console.error('error during payment consumer shutdown',error)
    }
  }
  console.log('All consumers disconnected. Exiting process.');
  process.exit();
};

// Register shutdown handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export const startConsumers = async () => {
  await courseConsumerObj.runConsumer();
  await instructorConsumerObj.runConsumer();
  await paymentConsumerObj.runConsumer();

  if (courseConsumerStarted) {
    console.log('Course consumer started successfully');
  } else {
    console.log('Course consumer failed to start');
  }
  
  if (instructorConsumerStarted) {
    console.log('Instructor consumer started successfully');
  } else {
    console.log('Instructor consumer failed to start');
  }

  if (paymentConsumerStarted) {
    console.log('payment consumer started successfully');
  } else {
    console.log('payment consumer failed to start');
  }
};
