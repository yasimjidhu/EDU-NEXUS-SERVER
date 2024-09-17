import { Request, Response } from 'express';
import { PayoutUseCase } from '../../application/usecases/payoutUseCase';
import Stripe from 'stripe';

export class PayoutController {
    private payoutUseCase: PayoutUseCase;
    private stripe:Stripe

    constructor(payoutUseCase: PayoutUseCase,
        stripe:Stripe
    ) {
        this.payoutUseCase = payoutUseCase,
        this.stripe = stripe
    }

    async getAvailablePayoutsForAdmin(req: Request, res: Response): Promise<void> {
        try {
          const adminStripeAccountId = req.params.adminStripeAccountId
          const availablePayouts = await this.payoutUseCase.getAvailablePayoutsForAdmin(adminStripeAccountId);
          res.json({ availablePayouts });
        } catch (error:any) {
          res.status(500).json({ message: error.message });
        }
      }
    
      async getInstructorAvailablePayouts(req: Request, res: Response): Promise<void> {
        const connectedAccountId = req.params.connectedAccountId;
        try {
          const availablePayouts = await this.payoutUseCase.getInstructorTotalPayouts(connectedAccountId);
          console.log('available payouts for insturctor',availablePayouts)
          res.json({ availablePayouts });
        } catch (error:any) {
          res.status(500).json({ message: error.message });
        }
      }


}
