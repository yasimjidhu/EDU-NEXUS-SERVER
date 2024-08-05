import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['localhost:9092'],
});

export const producer = kafka.producer();

export const sendMessage = async (topic: string, message: object) => {
  console.log(`Sending message to topic ${topic}:`, message);
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent successfully to topic ${topic}`);
  } catch (error) {
    console.error(`Error sending message to topic ${topic}`, error);
  } finally {
    await producer.disconnect();
  }
};

export const sendCourseApprovalMessage = (email: string, courseName: string, action: string) =>
  sendMessage('course-approval', { email, courseName, action });

export const sendInstructorApprovalMessage = (email: string, action: 'approve' | 'reject') =>
  sendMessage('instructor-approval', { email, action });
