import { ProducerBatch } from "kafkajs";
import { producer } from "./kafkaProducer";
import { BlockUserMessage, UnblockUserMessage } from "./messageTypes";

export const sendBlockUserMessage = async (email: string) => {
    const message: BlockUserMessage = { email, action: 'block' };
    console.log('block message sent to auth service',email)
    await sendMessage('user-status', message);
};

export const sendUnblockUserMessage = async (email: string) => {
    const message: UnblockUserMessage = { email, action: 'unblock' };
    console.log('unblock message sent to auth service',email)
    await sendMessage('user-status', message);
};

async function sendMessage(topic: string, payload: BlockUserMessage | UnblockUserMessage) {
    try {
        await producer.connect();

        const batch: ProducerBatch = {
            topicMessages: [
                {
                    topic,
                    messages: [
                        { value: JSON.stringify(payload) }
                    ]
                }
            ]
        };

        await producer.sendBatch(batch);
        console.log(`${payload.action} message sent successfully for ${payload.email}`);
    } catch (error) {
        console.error('Error sending message', error);
    } finally {
        await producer.disconnect();
    }
}