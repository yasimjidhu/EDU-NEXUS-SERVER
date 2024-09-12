import { Request, Response } from 'express';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';
import { StripeWebhookUseCase } from '../../application/usecases/WebHookUseCase';
import Stripe from 'stripe';

export class PayoutController {
    private payoutUseCase: PayoutUseCase;
    private webHookUseCase:StripeWebhookUseCase;
    private stripe:Stripe

    constructor(payoutUseCase: PayoutUseCase,
        webHookUseCase:StripeWebhookUseCase,
        stripe:Stripe
    ) {
        this.payoutUseCase = payoutUseCase,
        this.webHookUseCase = webHookUseCase,
        this.stripe = stripe
    }

    // Request Payout for Admins
    public async requestAdminPayout(req: Request, res: Response): Promise<void> {
        try {
            const { paymentId, accountId, amount, currency } = req.body;

            // Validation
            if (!paymentId || !accountId || !amount || !currency) {
                res.status(400).json({ message: 'Missing required fields' });
            }

            // Request a payout via Use Case
            const result = await this.payoutUseCase.requestAdminPayout(paymentId, accountId, amount, currency);

            res.status(201).json({ message: 'Admin payout requested successfully', result });
        } catch (error) {
            console.error('Error requesting admin payout:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // Request Payout for Instructors
    public async requestInstructorPayout(req: Request, res: Response): Promise<void> {
        try {
            console.log('request instructor payout reached in backend', req.body)
            const { paymentId, accountId, amount, currency,email } = req.body;

            // Validation
            if (!paymentId || !accountId || !amount || !currency || !email) {
                res.status(400).json({ message: 'Missing required fields' });
            }

            // Request a payout via Use Case
            const result = await this.payoutUseCase.requestInstructorPayout(paymentId, accountId, amount, currency,email);

            res.status(201).json({ message: 'Instructor payout requested successfully', result });
        } catch (error) {
            console.error('Error requesting instructor payout:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    public async handleStripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        try {
            // Use Stripe to construct the event
            const event = this.stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);

            // Pass the event to the use case for processing
            await this.webHookUseCase.processEvent(event);

            res.json({ received: true });
        } catch (error:any) {
            console.error('Error handling webhook:', error);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    async getInstructorAvailablePayouts(req: Request, res: Response): Promise<void> {
        const { instructorId } = req.params;
        try {
          const availablePayouts = await this.payoutUseCase.getAvailablePayoutsForInstructor(instructorId);
          res.status(200).json({ availablePayouts });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
    }

    async getAvailablePayoutsForAdmin(req: Request, res: Response): Promise<void> {

        try {
          const availablePayouts = await this.payoutUseCase.getAvailablePayoutsForAdmin();
          console.log('available payouts',availablePayouts)
          res.status(200).json({ availablePayouts });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
    }

    
      


    // Get Payouts by Payment ID
    // public async getPayoutsByPaymentId(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { paymentId } = req.params;

    //         if (!paymentId) {
    //             res.status(400).json({ message: 'Payment ID is required' });
    //         }

    //         const payouts = await this.payoutUseCase.getPayoutsForPayment(paymentId);

    //         res.status(200).json(payouts);
    //     } catch (error) {
    //         console.error('Error fetching payouts:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // }

    // Update Payout Status
    // public async updatePayoutStatus(req: Request, res: Response): Promise<void> {
    //     try {
    //         const { payoutId } = req.params;
    //         const { status } = req.body;

    //         if (!status) {
    //             res.status(400).json({ message: 'Status is required' });
    //         }

    //         await this.payoutUseCase.updatePayoutStatus(payoutId, status);

    //         res.status(200).json({ message: 'Payout status updated successfully' });
    //     } catch (error) {
    //         console.error('Error updating payout status:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // };

}
