// Payment Service Router (routes.ts)

import { Router } from 'express';
import Stripe from 'stripe';
import pool from '../../infrastructure/database/paymentDb';
import { authMiddleware } from '../middlewares/authenticationMiddleware';
import { adminMiddleware, instructorMiddleware } from '../middlewares/authorizationMiddleware';
import { PayoutRepositoryImpl } from '../../infrastructure/repositories/payoutRepositoryImpl';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';
import { PayoutController } from '../controllers/payoutController';
import { StripeWebhookUseCase } from '../../application/usecases/WebHookUseCase';
import bodyParser from 'body-parser';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
const payoutRepository = new PayoutRepositoryImpl(pool);
const payoutUseCase = new PayoutUseCase(payoutRepository, stripe);
const webHookUseCase = new StripeWebhookUseCase(payoutRepository);
const payoutController = new PayoutController(payoutUseCase, webHookUseCase, stripe);

const router = Router();

// Payout routes
router.post('/admin', authMiddleware, adminMiddleware, payoutController.requestAdminPayout.bind(payoutController));
router.post('/instructor', authMiddleware, instructorMiddleware, payoutController.requestInstructorPayout.bind(payoutController));

// Webhook route, using raw body parser
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), payoutController.handleStripeWebhook.bind(payoutController));

// payout routes
router.get('/available-payouts', authMiddleware, adminMiddleware, payoutController.getAvailablePayoutsForAdmin.bind(payoutController));
router.get('/available-payouts/:instructorId', authMiddleware, instructorMiddleware, payoutController.getInstructorAvailablePayouts.bind(payoutController));

export default router;
