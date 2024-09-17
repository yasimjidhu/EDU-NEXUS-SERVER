import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { StartPaymentDb } from './infrastructure/database/paymentDb';
import initializeDatabase from './infrastructure/database/createTable';
import router from './presentation/routes';

dotenv.config();

const app = express();

app.use(cookieParser());

app.use('/', router)

initializeDatabase()
StartPaymentDb()
initializeDatabase()
app.listen(3005, () => {
  console.log('payment service running on port 3005 ');
})
