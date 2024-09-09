import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { router } from './presentation/routes/paymentRoute';
import { StartPaymentDb } from './infrastructure/database/paymentDb';
import initializeDatabase from './infrastructure/database/createTable';
import { createTestCharge } from './infrastructure/services/test';



dotenv.config();  

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/payment', router)

  // Example usage:
  createTestCharge(20000).then(charge => {
    console.log('Charge details:', charge);
  }).catch(error => {
    console.error('Failed to create charge:', error);
  });
  

StartPaymentDb()
initializeDatabase()
app.listen(3005, () => {
  console.log('payment service running on port 3005 ');
})
