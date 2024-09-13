import { Request, Response } from 'express';
import { ProcessStripeWebhook } from '../../../application/use-case/processWebhook';
import { stripe } from '../../../config/stripe';

const processStripeWebhook = new ProcessStripeWebhook();

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
    await processStripeWebhook.execute(event); // Delegate to use case

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
