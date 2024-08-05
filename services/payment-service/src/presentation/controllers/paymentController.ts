import { Request, Response } from 'express';
import { PaymentUseCase } from '../../application/usecases/paymentUseCase';

export class PaymentController {
  private paymentUseCase: PaymentUseCase;

  constructor(paymentUseCase: PaymentUseCase) {
    this.paymentUseCase = paymentUseCase;
  }

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentUseCase.createCheckoutSession(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async completePurchase(req: Request, res: Response): Promise<void> {
    const {sessionId} = req.body
    try {
      const result = await this.paymentUseCase.create(sessionId);
      res.status(200).json({result,success:true});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}