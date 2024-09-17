import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { TCourse } from '../../shared/types/courseTypes';
import { KafkaProducer } from '../../infrastructure/messaging/kafka/producer';
import { PaymentEntity } from '../../domain/entities/payment';
import Stripe from 'stripe';
import { StripeService } from '../../infrastructure/services/stripeService';
import axios from 'axios';

export class PaymentUseCase {
  private paymentRepository: PaymentRepository;
  private stripe: Stripe;
  private producer: KafkaProducer;
  private stripeService: StripeService;

  constructor(
    paymentRepository: PaymentRepository,
    stripe: Stripe,
    producer: KafkaProducer,
    stripeService: StripeService
  ) {
    this.paymentRepository = paymentRepository;
    this.stripe = stripe;
    this.producer = producer;
    this.stripeService = stripeService
  }

  async createCheckoutSession(course: TCourse): Promise<Stripe.Checkout.Session> {
    console.log('course in payment', course)
    try {
      const { currency, course_name, amount, user_id, course_id, instructor_id, email, adminAccountId, instructorAccountId } = course;

      if (!currency || !course_name || !amount || !user_id || !course_id || !instructor_id || !email || !adminAccountId || !instructorAccountId) {
        throw new Error('Missing required course information');
      }

      // Create a Stripe Checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: course_name,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        client_reference_id: user_id,
        metadata: {
          courseId: course_id,
          courseName: course_name,
          instructorId: instructor_id,
          adminAccountId: adminAccountId,
          instructorAccountId: instructorAccountId,
          email,
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async create(sessionId: string): Promise<void> {
    try {

      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      // Fetch conversion rate (INR to USD)
      const conversionRate = await this.fetchConversionRate('INR', 'USD');
      const amountInINR = session.amount_total! / 100; // Convert amount from cents to INR

      // Convert INR to USD
      const amountInUSD = amountInINR * conversionRate;

      // Convert USD amount to cents for Stripe
      const amountInUSDCents = Math.round(amountInUSD * 100);

      // Calculate admin and instructor amounts in USD
      const adminAmountUSD = amountInUSD * 0.3;
      const instructorAmountUSD = amountInUSD * 0.7;

      // Convert USD amounts to cents
      const adminAmount = Math.round(adminAmountUSD * 100); // Amount in cents
      const instructorAmount = Math.round(instructorAmountUSD * 100); // Amount in cents

      const paymentIntentId = session.payment_intent as string;

      // Save payment record in the database
      const payment = new PaymentEntity(
        '',
        session.id,
        paymentIntentId,
        session.client_reference_id!,
        session.metadata?.instructorId!,
        session.metadata?.courseId!,
        amountInINR,
        amountInUSDCents,
        adminAmount,
        instructorAmount,
        'usd',
        'completed',
        new Date(),
        new Date(),
        session.metadata?.adminAccountId,
        session.metadata?.instructorAccountId,
        'pending',
        'pending'
      );
      console.log('payment going to save', payment)
      const savedPayment = await this.paymentRepository.create(payment);

      // Create transfers
      await this.stripe.transfers.create({
        amount: instructorAmount,
        currency: 'usd',
        destination: session.metadata?.instructorAccountId!,
        transfer_group: session.id,
      });

      await this.updatePaymentStatus(session.id, 'instructor', 'completed');

      await this.stripe.transfers.create({
        amount: adminAmount,
        currency: 'usd',
        destination: session.metadata?.adminAccountId!,
        transfer_group: session.id,
      });

      await this.updatePaymentStatus(session.id, 'admin', 'completed');

      // Publish enrollment event to content service
      await this.publishEnrollmentEvent(session);
    } catch (error) {
      console.error('Error handling successful payment:', error);
      await this.handlePaymentFailure(sessionId, error);
      throw new Error('Failed to process payment');
    }
  }

  async fetchConversionRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const api = process.env.EXCHANGE_RATE_API;

    try {
      // Fetch conversion rates from the API using axios
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/df9d59df3e26aea3869c4905/latest/${fromCurrency}`)
      return response.data.conversion_rates[toCurrency];
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      throw new Error('Failed to fetch conversion rate');
    }
  }
  // Method to update the payment status in the database
  async updatePaymentStatus(sessionId: string, type: 'admin' | 'instructor', status: 'completed' | 'failed'): Promise<void> {
    try {
      const updatedPayment = await this.paymentRepository.updateTransferStatus(sessionId, type, status);
      console.log(`${type} transfer status updated to ${status} for session ${sessionId}`);
    } catch (error) {
      console.error(`Error updating ${type} transfer status for session ${sessionId}:`, error);
    }
  }
  // Method to handle payment failure
  async handlePaymentFailure(sessionId: string, error: any): Promise<void> {
    try {
      // Update payment status to failed in case of any error
      await this.updatePaymentStatus(sessionId, 'admin', 'failed');
      await this.updatePaymentStatus(sessionId, 'instructor', 'failed');
      console.error(`Payment process failed for session ${sessionId}:`, error);
    } catch (updateError) {
      console.error('Error updating payment status to failed:', updateError);
    }
  }
  public async createConnectedAccount(instructorId: string, email: string): Promise<any> {
    return await this.stripeService.createConnectedAccount(instructorId, email)
  }
  public async createAccountLink(accountId: string): Promise<any> {
    return await this.stripeService.createAccountLink(accountId)
  }
  public async handleOnboardingCompletion(accountId: string): Promise<any> {
    return await this.stripeService.checkAccountStatus(accountId)
  }
  private async publishEnrollmentEvent(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      await this.producer.produce('enrollment-events', {
        type: 'ENROLLMENT_CREATED',
        payload: {
          userId: session.client_reference_id!,
          instructorId: session.metadata?.instructorId,
          courseId: session.metadata?.courseId!,
          enrolledAt: new Date(),
          completionStatus: 'enrolled',
          progress: {
            completedLessons: [],
            completedAssessments: [],
            overallCompletionPercentage: 0,
          },
        },
      });
    } catch (error) {
      console.error('Error publishing enrollment event:', error);
    }
  }
  async getPaymentStatus(sessionId: string): Promise<string> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status;
    } catch (error) {
      console.error('Error retrieving payment status:', error);
      throw new Error('Failed to retrieve payment status');
    }
  }
  async processRefund(userId:string,courseId:string) {
    try {
      console.log(['userid and courseid in processrefund',userId,courseId])
      const payment = await this.paymentRepository.findPaymentIntentId(userId,courseId);
      if (!payment) {
        throw new Error('payment not found.');  
      }

      // Define the refund criteria
      const refundEligibility = await this.checkRefundEligibility(payment);
      if (!refundEligibility.isEligible) {
        throw new Error('Refund not eligible due to: ' + refundEligibility.reason);
      }

      // Refund the transaction
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: payment.amountInINR ? payment.amountInINR * 100 : undefined,
      });

      const instructorRefundAmount = payment.amountInINR! * 0.7; // 70% from instructor
      const adminRefundAmount = payment.amountInINR! *  0.3  // 30% from admin

      // Update transaction status in your database
      await this.paymentRepository.updateStatus(payment.stripe_payment_intent_id, 'refunded');

      return refund;
    } catch (error:any) {
      console.error('Error processing refund:', error);
      throw new Error('Refund failed: ' + error.message);
    }
  }
  async checkRefundEligibility(payment: PaymentEntity):Promise<{isEligible:boolean,reason?:string}> {
    const currentDate = new Date();
    const purchaseDate = new Date(payment.createdAt);
    const daysSincePurchase = Math.ceil((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

    // Example: Refund allowed within 14 days of purchase
    if (daysSincePurchase > 14) {
      return { isEligible: false, reason: 'Purchase is older than 14 days' };
    }

    return { isEligible: true };
  }
  async getTransactions(filter: { [key: string]: any } = {}): Promise<{ transactions: PaymentEntity[], totalPages: number }> {
    try {
      const response = await this.paymentRepository.findTransactions(filter);
      console.log('students transactions response',response)
      return response;
    } catch (error) {
      throw new Error('Failed to retrieve transactions');
    }
  }
  async getInstructorCoursesTransaction(instructorId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    return await this.paymentRepository.findByInstructorId(instructorId, limit, offset)
  }
  async getStudentCoursesTransaction(studentId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    return await this.paymentRepository.findByStudentId(studentId, limit, offset)
  }
  async getTotalTransactionsForInstructor(instructorId: string): Promise<number> {
    return await this.paymentRepository.getTotalTransactionsForInstructor(instructorId)
  }
  async getTotalTransactionsForStudent(studentId: string): Promise<number> {
    return await this.paymentRepository.getTotalTransactionsForStudent(studentId)
  }
  async getInstructorTodayRevenue(instructorId: string): Promise<number> {
    return await this.paymentRepository.getTodayRevenueForInstructor(instructorId);
  }
  async getTodayRevenueForAdmin(): Promise<number> {
    return await this.paymentRepository.getTodayRevenueForAdmin()
  }
  async getInstructorTotalEarnings(instructorId: string): Promise<number> {
    return await this.paymentRepository.getTotalEarningsForInstructor(instructorId);
  }
  async getAdminTotalEarnings(): Promise<number> {
    return await this.paymentRepository.getTotalEarningsForAdmin();
  }
}
