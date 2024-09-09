import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { TCourse } from '../../shared/types/courseTypes';
import { KafkaProducer } from '../../infrastructure/messaging/kafka/producer';
import { PaymentEntity } from '../../domain/entities/payment';
import Stripe from 'stripe';
import { StripeService } from '../../infrastructure/services/stripeService';

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
    console.log('course in payment',course)
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

      const adminAmount = Math.round(session.amount_total! * 0.3);
      const instructorAmount = Math.round(session.amount_total! * 0.7);

      // Save payment record in the database
      const payment = new PaymentEntity(
        session.id,
        session.client_reference_id!,
        session.metadata?.instructorId!,
        session.metadata?.courseId!,
        session.amount_total!,
        adminAmount,
        instructorAmount,
        session.currency!,
        'completed',
        new Date(),
        new Date(),
        session.metadata?.adminAccountId,
        session.metadata?.instructorAccountId,
        'pending',
        'pending'
      );

      const savedPayment = await this.paymentRepository.create(payment);
      console.log('Payment saved in DB:', savedPayment);

      // Create transfers
      await this.stripe.transfers.create({
        amount: instructorAmount,
        currency: session.currency!,
        destination: session.metadata?.instructorAccountId!,
        transfer_group: session.id,
      });

      // Update instructor transfer status to 'completed'
      await this.updatePaymentStatus(session.id, 'instructor', 'completed');

      await this.stripe.transfers.create({
        amount: adminAmount,
        currency: session.currency!,
        destination: session.metadata?.adminAccountId!, // Use actual admin account ID from metadata
        transfer_group: session.id,
      });

      // Update admin transfer status to 'completed'
      await this.updatePaymentStatus(session.id, 'admin', 'completed');

      // Publish enrollment event to content service
      await this.publishEnrollmentEvent(session);
      console.log('Payment info sent to the content service');
    } catch (error) {
      console.error('Error handling successful payment:', error);
      await this.handlePaymentFailure(sessionId, error);
      throw new Error('Failed to process payment');
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

  async refundPayment(sessionId: string): Promise<Stripe.Refund> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      if (!session.payment_intent) {
        throw new Error('No payment intent found for this session');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: session.payment_intent as string,
      });

      // Update the payment status in your database
      await this.paymentRepository.updateStatus(sessionId, 'refunded');

      // You might want to publish a refund event here

      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }
  // async handlePaymentFailure(sessionId: string, error: any): Promise<void> {

  //   console.log('payment failure funciton called')
  //   const maxRetries = 3;
  //   let retries = 0;

  //   while (retries < maxRetries) {
  //     try {
  //       const session = await this.stripe.checkout.sessions.retrieve(sessionId);

  //       // update payment status in the database
  //       await this.paymentRepository.updateStatus(sessionId, 'failed');

  //       // notify the user about the payment failure
  //       await this.notifyPaymentFailure(session)

  //       console.error('Payment Failed', {
  //         sessionId,
  //         userId: session.client_reference_id,
  //         courseId: session.metadata?.courseId,
  //         error: error.message,
  //       });


  //       break
  //     } catch (retryError) {
  //       retries++

  //       if (retries >= maxRetries) {
  //         console.error('Max retries reached for handling payment failure:', retryError);
  //         throw new Error('Failed to handle payment failure after multiple attempts')
  //       }

  //       // wait before retrying 
  //       await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)))
  //     }
  //   }
  // }
  private async notifyPaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.client_reference_id!;
    const courseId = session.metadata?.courseId!;
    const courseName = session.metadata?.courseName || 'the course';
    const email = session.metadata?.email || 'test@gmail.com'

    const notificationPayload = {
      type: 'PAYMENT_FAILURE_NOTIFICATION',
      payload: {
        email: email,
        message: `Your payment for ${courseName} has failed. Please try again or contact support if the issue persists.`,
        metadata: {
          courseId: courseId,
          sessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
        }
      }
    };

    try {
      await this.producer.produce('payment-events', notificationPayload);
      console.log(`Payment failure notification sent to user ${userId}`);
    } catch (error) {
      console.error('Failed to send payment failure notification:', error);
    }
  }
  async getTransactions(filter: { [key: string]: any } = {}): Promise<PaymentEntity[]> {
    try {
      // Here we assume filter is already in the correct format
      const transactions = await this.paymentRepository.findTransactions(filter);
      console.log('transactions in usecase', transactions)
      return transactions;
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }
  async getInstructorCoursesTransaction(instructorId: string): Promise<PaymentEntity[]> {
    return await this.paymentRepository.findByInstructorId(instructorId)
  }
}
