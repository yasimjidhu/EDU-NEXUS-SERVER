import { Router } from 'express';
import Stripe from 'stripe';
import pool from '../../infrastructure/database/paymentDb';
import { PaymentUseCase } from '../../application/usecases/paymentUseCase';
import { PaymentRepositoryImpl } from '../../infrastructure/repositories/paymentRepository';
import { PaymentController } from '../controllers/paymentController';
import { KafkaProducer } from '../../infrastructure/messaging/kafka/producer';
import { authMiddleware } from '../middlewares/authenticationMiddleware';
import { adminMiddleware, studentMiddleware } from '../middlewares/authorizationMiddleware';
import { StripeService } from '../../infrastructure/services/stripeService';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// messaging
const producer = new KafkaProducer()

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
const stripeService = new StripeService(stripe)
const paymentRepository = new PaymentRepositoryImpl(pool);
const paymentUseCase = new PaymentUseCase(paymentRepository, stripe,producer,stripeService);
const paymentController = new PaymentController(paymentUseCase);

export const router = Router();


router.post('/create-checkout-session',authMiddleware,studentMiddleware, paymentController.createCheckoutSession.bind(paymentController));
router.post('/create-account-link', paymentController.createConnectedAccount.bind(paymentController));
router.get('/complete-onboarding/:accountId', paymentController.handleOnboardingCompletion.bind(paymentController));
router.post('/complete-purchase',authMiddleware,studentMiddleware,paymentController.completePurchase.bind(paymentController))
router.get('/find-transactions',authMiddleware,adminMiddleware, paymentController.findTransactions.bind(paymentController));
router.get('/find-transactions/:instructorId',authMiddleware, paymentController.findInstructorCoursesTransaction.bind(paymentController));


