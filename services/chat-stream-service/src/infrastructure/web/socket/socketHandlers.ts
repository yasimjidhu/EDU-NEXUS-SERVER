import {Server,Socket} from 'socket.io'
import {SendMessageUseCase} from '//'

export const setupSocketHandlers = (io:Server,sendMessageUseCase:SendMessageUseCase)=>{
    io.on('connection',(socket:Socket)=>{
        console.log('New Client connected')

        socket.on('join',(conversationId:string)=>{
            socket.join(conversationId)
            console.log(`User Joined conversation: ${conversationId}`)
        })

        socket.on('leave',(conversationId:string)=>{
            socket.leave(conversationId)
            console.log(`User left conversation: ${conversationId}`)
        })

        socket.on('message',async (data:{conversationId:string,text:string})=>{
            try {
                const message = await sendMessageUseCase.execute({
                    conversationId:data.conversationId,
                    senderId:socket.data.user.id,
                    text:data.text,
                });
                io.to(data.conversationId).emit('message',message)
            } catch (error:any) {
                console.error('Error saing message:',error)
            }
        })

        socket.on('disconnect',()=>{
            console.log('Client disconnected')
        })
    })
}