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
      const response = await this.paymentUseCase.handleOnboardingCompletion(accountId)
      console.log('response of handle on boarding completeion', response)
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
  async requestRefund(req: Request, res: Response): Promise<void> {
    const { userId,courseId } = req.body
    try {
      const result = await this.paymentUseCase.processRefund(userId,courseId);
      res.status(200).json({ result, success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findTransactions(req: Request, res: Response): Promise<void> {
    const filter = req.query as { [key: string]: any };

    try {
      // Convert query parameters to the correct format if necessary
      const { transactions, totalPages } = await this.paymentUseCase.getTransactions(filter);
      res.status(200).json({ transactions, totalPages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findInstructorCoursesTransaction(req: Request, res: Response): Promise<void> {
    const { instructorId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    try {
      const transactions = await this.paymentUseCase.getInstructorCoursesTransaction(instructorId, limit, offset);

      const totalTransactions = await this.paymentUseCase.getTotalTransactionsForInstructor(instructorId);

      res.status(200).json({
        transactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findStudentrCoursesTransaction(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;
    console.log('find student course transaction',userId)
    try {
      const transactions = await this.paymentUseCase.getStudentCoursesTransaction(userId, limit, offset);
      const totalTransactions = await this.paymentUseCase.getTotalTransactionsForStudent(userId);
      console.log('transactions are',transactions)
      res.status(200).json({
        transactions,
        currentPage: page,
        totalPages: Math.ceil(totalTransactions / limit),
        totalTransactions
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTodayRevenue(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.params.instructorId as string
      const revenue = await this.paymentUseCase.getInstructorTodayRevenue(instructorId);
      res.status(200).json({ revenue });
    } catch (error) {
      console.error('Error fetching today\'s revenue:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s revenue' });
    }
  }

  // method to get today revenue for admin
  async getTodaysAdminRevenue(req: Request, res: Response): Promise<void> {
    try {
      const revenue = await this.paymentUseCase.getTodayRevenueForAdmin();
      res.status(200).json({ revenue });
    } catch (error) {
      console.error('Error fetching today\'s revenue:', error);
      res.status(500).json({ error: 'Failed to fetch today\'s revenue' });
    }
  }
  // Method to get total earnings
  async getTotalEarnings(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.params.instructorId as string
      const totalEarnings = await this.paymentUseCase.getInstructorTotalEarnings(instructorId);
      res.status(200).json({ totalEarnings });
    } catch (error) {
      console.error('Error fetching total earnings:', error);
      res.status(500).json({ error: 'Failed to fetch total earnings' });
    }
  }
  // Method to get total earnings of admin
  async getTotalEarningsOfAdmin(req: Request, res: Response): Promise<void> {
    try {
      const totalEarnings = await this.paymentUseCase.getAdminTotalEarnings();
      res.status(200).json({ totalEarnings });
    } catch (error) {
      console.error('Error fetching total earnings:', error);
      res.status(500).json({ error: 'Failed to fetch total earnings' });
    }
  }

}