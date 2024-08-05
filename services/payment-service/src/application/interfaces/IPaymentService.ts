export interface IPaymentService {
    createPaymentIntent(userId: string,courseId:string, amount: number, currency: string): Promise<{ clientSecret: string }>;
    confirmPayment(paymentIntentId: string): Promise<void>;
  }