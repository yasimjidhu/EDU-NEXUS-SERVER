import {  KafkaMessage, Consumer } from 'kafkajs';
import { EmailService } from '../services/emailService';
import { kafka } from './kafka';

const emailService = new EmailService();

const consumer = kafka.consumer({ groupId: 'notification-group' });

const runConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connected');

    // Subscribe to all topics before running the consumer
    await consumer.subscribe({ topic: 'course-approval', fromBeginning: true });
    await consumer.subscribe({ topic: 'instructor-approval', fromBeginning: true });
    await consumer.subscribe({ topic: 'payment-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'verification-notifications', fromBeginning: true });
    await consumer.subscribe({ topic: 'kyc-verified', fromBeginning: true });
    await consumer.subscribe({ topic: 'kyc-verification-failed', fromBeginning: true });
    
    console.log('Consumer subscribed to topics');

    // Now start the consumer after all subscriptions
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
            case 'kyc-verified':
              await handleKycVerificationSuccess(message);
              break;
            case 'kyc-verification-failed':
              await handleKycVerificationFailed(message);
              break;
            default:
              console.warn('Unknown topic received', topic);
          }
          // Commit the offset after processing the message
          await consumer.commitOffsets([{ topic, partition, offset: (parseInt(message.offset) + 1).toString() }]);
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

const handleKycVerificationSuccess = async (message: KafkaMessage) => {
  const { email, action } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('KYC verification success message received', { email, action });

  await emailService.sendKycVerificationCompletedEmail(email);
  console.log('KYC verification completed email sent', email);
};

const handleKycVerificationFailed = async (message: KafkaMessage) => {
  const { email, action } = JSON.parse(message.value?.toString() ?? '{}');
  console.log('KYC verification failed message received', { email, action });

  await emailService.sendKycVerificationFailedEmail(email,action);
  console.log('KYC verification failed email sent', email);
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
