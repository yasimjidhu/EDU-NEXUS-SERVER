import { Kafka, Producer } from 'kafkajs';

class KafkaProducer {
  private producer: Producer;
  private connected: boolean = false; // Track connection state

  constructor() {
    this.producer = this.createProducer();
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: 'payment-service-client',
      brokers: ['localhost:9092'],
    });
    return kafka.producer();
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true; // Update connection state
      console.log('Kafka producer connected');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false; // Update connection state
      console.log('Kafka producer disconnected');
    }
  }

  public async produce(topic: string, message: any): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(`Message produced to topic ${topic}:`, message);
    } catch (error) {
      console.error('Error producing message:', error);
      throw new Error('Failed to send message to Kafka');
    }
  }
}

// Export a single instance of the KafkaProducer (Singleton Pattern)
export const kafkaProducer = new KafkaProducer();

// Function to notify the user service
export async function notifyUserService(accountId: string, chargesEnabled: boolean): Promise<void> {
  const payload = {
    stripeAccountId: accountId,
    chargesEnabled,
  };

  try {
    await kafkaProducer.produce('instructor-status-updates', payload);
  } catch (error) {
    console.error('Error in notifyUserService:', error);
  }
}
