import { Router } from 'express';
import Stripe from 'stripe';
import pool from '../../infrastructure/database/paymentDb';
import { authMiddleware } from '../middlewares/authenticationMiddleware';
import { adminMiddleware, instructorMiddleware } from '../middlewares/authorizationMiddleware';
import { PayoutRepositoryImpl } from '../../infrastructure/repositories/payoutRepositoryImpl';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';
import { PayoutController } from '../controllers/payoutController';
import { StripeWebhookUseCase } from '../../application/usecases/WebHookUseCase';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
const payoutRepository = new PayoutRepositoryImpl(pool);
const payoutUseCase = new PayoutUseCase(payoutRepository, stripe,);
const webHookUseCase = new StripeWebhookUseCase(payoutRepository)
const payoutController = new PayoutController(payoutUseCase,webHookUseCase,stripe);

const router = Router();

// payout endpoints
router.post('/webhook',payoutController.handleStripeWebhook.bind(payoutController)) 
router.post('/instructor', authMiddleware, instructorMiddleware, payoutController.requestInstructorPayout.bind(payoutController))
router.post('/admin', authMiddleware, adminMiddleware, payoutController.requestAdminPayout.bind(payoutController))
router.get('/available-payouts/:instructorId', authMiddleware, instructorMiddleware, payoutController.getInstructorAvailablePayouts.bind(payoutController))

export default router