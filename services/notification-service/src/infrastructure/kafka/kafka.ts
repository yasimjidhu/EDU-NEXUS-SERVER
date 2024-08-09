import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'notification-service-client',
    brokers: ['kafka:9093'],
});