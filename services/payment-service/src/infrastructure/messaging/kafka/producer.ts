import { Kafka, Producer } from 'kafkajs';

export class KafkaProducer {
  private producer: Producer;

  constructor() {
    const kafka = new Kafka({
      clientId: 'payment-service',
      brokers: ['localhost:9092'] 
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