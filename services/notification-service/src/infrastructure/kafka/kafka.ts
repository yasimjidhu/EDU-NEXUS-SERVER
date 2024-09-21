import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: 'notification-service-client',
    brokers: ['cluster_0.confluent.cloud:9092'],
    ssl: true,
    sasl: {
      mechanism: 'plain', 
      username: process.env.KAFKA_API_KEY || '',
      password: process.env.KAFKA_SECRET || '',
    },
  });