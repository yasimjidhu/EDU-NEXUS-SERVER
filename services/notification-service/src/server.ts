import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import axios from "axios";
import { run } from "./infrastructure/kafka/instructorApprovalConsumer";

dotenv.config();

const app = express();
app.use(cookieParser())


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));
axios.defaults.withCredentials = true;

run().then(()=>{
  app.listen(3003, () => {
    console.log("notification service running on port 3003");
  });
}).catch((err:any)=>{
  console.log(err)
})

   
