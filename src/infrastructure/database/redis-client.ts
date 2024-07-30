import { createClient } from "redis";

console.log(process.env.REDIS_HOST)
console.log(process.env.REDIS_PORT)
const client = createClient({
    url:`redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
})

client.on('error',(err)=>{
    console.log('Redis client error',err)
})

client.connect()

export default client