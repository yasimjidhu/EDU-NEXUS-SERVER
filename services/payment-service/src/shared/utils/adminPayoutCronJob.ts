import cron from 'node-cron';
import { stripe } from '../../presentation/routes/paymentRoute';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';

// Initialize services and use cases
const payoutUseCase = new PayoutUseCase(stripe);


// Schedule the cron job to run once every day at 00:00 (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled admin payout job...');
  await payoutUseCase.initiateAdminPayout()
});

console.log('Admin payout cron job scheduled to run every day at midnight.');
