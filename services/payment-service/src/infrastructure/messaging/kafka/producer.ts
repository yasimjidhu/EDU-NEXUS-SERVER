import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer {
  private producer: Producer;

  constructor() {
     const kafka = new Kafka({
      clientId: 'payment-service-client',
      brokers: ['cluster_0.confluent.cloud:9092'],
      ssl: true,
      sasl: {
        mechanism: 'plain', 
        username: process.env.KAFKA_API_KEY || '',
        password: process.env.KAFKA_SECRET || '',
      },
    });
    this.producer = kafka.producer();
  }

  async produce(topic: string, message: any) {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }
}