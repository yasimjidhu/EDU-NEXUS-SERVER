import { Router } from 'express';
import bodyParser from 'body-parser';
import { stripeWebhookHandler } from '../controllers/stripeWebhookController';

const router = Router();

// Stripe Webhook expects raw body
router.post('/', bodyParser.raw({ type: 'application/json' }), stripeWebhookHandler);

export default router;
