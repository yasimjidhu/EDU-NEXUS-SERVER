import { Kafka, KafkaMessage } from "kafkajs";
import { EmailService } from "../services/emailService";

const kafka = new Kafka({
    clientId:'content-service',
    brokers:['localhost:9092']
})

const consumer = kafka.consumer({groupId:'notification-group'})
const emailService = new EmailService()

export const runCourseEventConsumer = async ()=>{
    try{
        await consumer.connect()

        await consumer.subscribe({topic:'course-approval',fromBeginning:true})

        await consumer.run({
            eachMessage:async ({topic,partition,message}:{topic:string,partition:number,message:KafkaMessage})=>{
                try{
                    const {email,action,courseName} = JSON.parse(message.value?.toString() ?? '{}')
                    console.log('recieved message',email,'action',action,'courseName',courseName)

                    if(action === 'approve'){
                        await emailService.sendCourseApprovalEmail(email,courseName)
                        console.log('course approval email sent as notification',email)
                    }else if(action === 'reject'){
                        await emailService.sendCourseRejectionEmail(email,courseName)
                    }else{
                        console.warn('Unknown action created',action)
                    }

                    await consumer.commitOffsets([{topic,partition,offset:(parseInt(message.offset)+1).toString()}])
                }catch(error){
                    console.log('Error processing message',error)
                }
            }
        })
        console.log('consumer run started')
    }catch(error){
        console.log('error in consumer setup',error)
    }
}

const shutdown = async () => {
    try {
        console.log('Disconnecting consumer...');
        await consumer.disconnect();
        console.log('Consumer disconnected');
    } catch (error) {
        console.error('Error during shutdown', error);
    } finally {
        process.exit();
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);