import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser'
import axios from "axios";
import { run } from "./infrastructure/kafka/instructorApprovalConsumer";
import { runCourseEventConsumer } from "./infrastructure/kafka/courseApprovalConsumer";
import { startConsumers } from "./infrastructure/kafka/consumer";

dotenv.config();

const app = express();
app.use(cookieParser())


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

axios.defaults.withCredentials = true;

const start = async () => {
  try {
    await runCourseEventConsumer();
    await run()
    await startConsumers();
    app.listen(3003, () => {
      console.log('Notification service running on port 3003');
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

   
