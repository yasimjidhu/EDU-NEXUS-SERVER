// Payment Service Router (routes.ts)

import { Router } from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middlewares/authenticationMiddleware';
import { adminMiddleware, instructorMiddleware } from '../middlewares/authorizationMiddleware';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';
import { PayoutController } from '../controllers/payoutController';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
const payoutUseCase = new PayoutUseCase(stripe);
const payoutController = new PayoutController(payoutUseCase,stripe);

const router = Router();

// payout routes
router.get('/available-payouts/:adminStripeAccountId', authMiddleware, adminMiddleware, payoutController.getAvailablePayoutsForAdmin.bind(payoutController));
router.get('/available-payouts/:connectedAccountId', authMiddleware, instructorMiddleware, payoutController.getInstructorAvailablePayouts.bind(payoutController));

export default router;
