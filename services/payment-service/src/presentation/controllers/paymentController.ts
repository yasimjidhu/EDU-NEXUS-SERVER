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

  async createConnectedAccount(req: Request, res: Response): Promise<void> {
    const { instructorId, email } = req.body;
    try {
      const account = await this.paymentUseCase.createConnectedAccount(instructorId, email);
      const accountLinkUrl = await this.paymentUseCase.createAccountLink(account.id);
      console.log('url got', accountLinkUrl)
      res.status(200).json({ url: accountLinkUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleOnboardingCompletion(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params
    try {
      console.log('account id in backend',accountId)
      const response = await this.paymentUseCase.handleOnboardingCompletion(accountId)
      console.log('response of handle on boarding completeion',response)
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async completePurchase(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.body
    try {
      const result = await this.paymentUseCase.create(sessionId);
      res.status(200).json({ result, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async findTransactions(req: Request, res: Response): Promise<void> {
    const filter = req.query as { [key: string]: any };
    console.log('filter in find transactions', filter);

    try {
      // Convert query parameters to the correct format if necessary
      const transactions = await this.paymentUseCase.getTransactions(filter);
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  async findInstructorCoursesTransaction(req: Request, res: Response): Promise<void> {
    const { instructorId } = req.params;

    try {
      console.log('instructor id got>>>', instructorId)
      // Convert query parameters to the correct format if necessary
      const transactions = await this.paymentUseCase.getInstructorCoursesTransaction(instructorId);
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}