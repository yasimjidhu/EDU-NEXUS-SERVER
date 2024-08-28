import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'notification-service-client',
    brokers: ['localhost:9092'],
});