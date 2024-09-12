// presentation/routes/kycWebhook.ts
import express, { Request, Response } from 'express';
import { KycUseCase } from '../../../application/use-case/kycUseCase';
import { IKycUseCase } from '../../../application/interface/IKycUseCase';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/UserImpl';
import { stripe } from '../../../config/stripe';
import Stripe from 'stripe';

const router = express.Router();

router.post('/kyc/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

        // Construct the event from Stripe
        const event = stripeInstance.webhooks.constructEvent(req.body, sig!, endpointSecret);

        // Correct instantiation of KycUseCase
        const processWebhookUseCase = new KycUseCase(new UserRepositoryImpl(), stripe);

        // Execute the KYC use case
        await processWebhookUseCase.processWebhook(event);

        res.status(200).send('Webhook received');
    } catch (err) {
        console.error('Webhook signature verification failed.', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;
