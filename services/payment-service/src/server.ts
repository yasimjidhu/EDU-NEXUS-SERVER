import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import router from './presentation/routes';
import connectDB from './infrastructure/database/paymentDb';

dotenv.config();

const app = express();

app.use(cookieParser());

app.use('/', router)

connectDB()
app.listen(3005, () => {
  console.log('payment service running on port 3005 ');
})
