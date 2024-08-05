import { Router } from 'express';
import Stripe from 'stripe';
import pool from '../../infrastructure/database/paymentDb';
import { PaymentUseCase } from '../../application/usecases/paymentUseCase';
import { PaymentRepositoryImpl } from '../../infrastructure/repositories/paymentRepository';
import { PaymentController } from '../controllers/paymentController';
import { KafkaProducer } from '../../infrastructure/messaging/kafka/producer';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

// messaging
const producer = new KafkaProducer()

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
const paymentRepository = new PaymentRepositoryImpl(pool);
const paymentUseCase = new PaymentUseCase(paymentRepository, stripe,producer);
const paymentController = new PaymentController(paymentUseCase);

export const router = Router();


router.post('/create-checkout-session', paymentController.createCheckoutSession.bind(paymentController));
router.post('/complete-purchase',paymentController.completePurchase.bind(paymentController))


