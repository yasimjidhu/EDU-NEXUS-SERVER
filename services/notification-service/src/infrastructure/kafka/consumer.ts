import { Kafka, KafkaMessage, Consumer } from 'kafkajs';
import { EmailService } from '../services/emailService';

const kafka = new Kafka({
  clientId: 'notification-service-client',
  brokers: ['localhost:9092'],
});

const emailService = new EmailService();

const consumer = kafka.consumer({ groupId: 'notification-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connected');

    // Subscribe to multiple topics
    await consumer.subscribe({ topic: 'course-approval', fromBeginning: true });
    await consumer.subscribe({ topic: 'instructor-approval', fromBeginning: true });
    await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'verification-notifications', fromBeginning: true });
    console.log('Consumer subscribed to topics');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          switch (topic) {
            case 'course-approval':
              await handleCourseApprovalMessage(message);
              break;
            case 'instructor-approval':
              await handleInstructorApprovalMessage(message);
              break;
            case 'payment-events':
              await handlePaymentNotificationMessage(message);
              break;
            case 'verification-notifications':
              await handleVerificationNotificationMessage(message);
              break;
            default:
              console.warn('Unknown topic received', topic);
          }
          await consumer.commitOffsets([
            { topic, partition, offset: (parseInt(message.offset) + 1).toString() },
          ]);
        } catch (error) {
          console.error('Error processing message', error);
        }
      },
    });

    console.log('Consumer running');
  } catch (error) {
    console.error('Error in consumer setup', error);
  }
};

const handleCourseApprovalMessage = async (message: KafkaMessage) => {
  const { email, action, courseName } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received course approval message', { email, action, courseName });

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

const handleInstructorApprovalMessage = async (message: KafkaMessage) => {
  const { email, action } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received instructor approval message', { email, action });

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

const handlePaymentNotificationMessage = async (message: KafkaMessage) => {
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

const handleVerificationNotificationMessage = async (message: KafkaMessage) => {
  const { email, currently_due } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('Received verification notification message', { email, currently_due });

  await emailService.sendVerificationNotification(email, currently_due);
  console.log('Verification email sent', email);
};

const shutdown = async () => {
  console.log('Shutting down consumer...');
  try {
    await consumer.disconnect();
    console.log('Consumer disconnected');
  } catch (error) {
    console.error('Error during consumer shutdown', error);
  }
  console.log('Consumer disconnected. Exiting process.');
  process.exit();
};

// Register shutdown handlers
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export const startConsumer = async () => {
  await runConsumer();
};

startConsumer().catch((error) => {
  console.error('Error starting consumer', error);
});
