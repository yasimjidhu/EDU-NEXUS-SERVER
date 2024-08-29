import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { TCourse } from '../../shared/types/courseTypes';
import { KafkaProducer } from '../../infrastructure/messaging/kafka/producer';
import { PaymentEntity } from '../../domain/entities/payment';
import Stripe from 'stripe';

export class PaymentUseCase {
  private paymentRepository: PaymentRepository;
  private stripe: Stripe;
  private producer: KafkaProducer;

  constructor(
    paymentRepository: PaymentRepository,
    stripe: Stripe,
    producer: KafkaProducer,
  ) {
    this.paymentRepository = paymentRepository;
    this.stripe = stripe;
    this.producer = producer;
  }

  async createCheckoutSession(
    course: TCourse,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: course.currency,
              product_data: {
                name: course.course_name,
              },
              unit_amount: Math.round(course.amount * 100), // Ensure integer
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        client_reference_id: course.user_id,
        metadata: {
          courseId: course.course_id,
          courseName:course.course_name,
          instructorId:course.instructor_id,
          email:course.email
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
      // Retrieve the session details from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
  
      // Check if the payment is completed
      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }
  
      // Calculate admin and instructor amounts (e.g., 30% to admin and 70% to instructor)
      const adminAmount = Math.round(session.amount_total! * 0.3);
      const instructorAmount = Math.round(session.amount_total! * 0.7);
  
      // Create a new PaymentEntity with the session details
      const payment = new PaymentEntity(
        session.id,
        session.client_reference_id!,     // User ID
        session.metadata?.instructorId!,  // Instructor ID
        session.metadata?.courseId!,      // Course ID
        session.amount_total!,            // Total amount
        adminAmount,                      // Admin amount
        instructorAmount,                 // Instructor amount
        session.currency!,                // Currency
        'completed',                      // Status
        new Date(),                       // Created at
        new Date()                        // Updated at
      );
  
      // Save the payment record in the database
      const savedPayment = await this.paymentRepository.create(payment);
      console.log('Payment saved in DB:', savedPayment);
  
      // Publish enrollment event to the content service
      await this.publishEnrollmentEvent(session);
      console.log('Payment info sent to the content service');
  
      // Return the saved payment
      return savedPayment;
    } catch (error) {
      console.error('Error handling successful payment:', error);
  
      // Handle payment failure (log, send notifications, etc.)
      await this.handlePaymentFailure(sessionId, error);
      
      // Rethrow the error to indicate failure
      throw new Error('Failed to process payment');
    }
  }
  

  private async publishEnrollmentEvent(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      await this.producer.produce('enrollment-events', {
        type: 'ENROLLMENT_CREATED',
        payload: {
          userId: session.client_reference_id!,
          instructorId:session.metadata?.instructorId,
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
  async handlePaymentFailure(sessionId:string,error:any):Promise<void>{

    console.log('payment failure funciton called')
    const maxRetries  = 3;
    let retries = 0;

    while(retries < maxRetries ){
      try {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);

        // update payment status in the database
        await this.paymentRepository.updateStatus(sessionId,'failed');

        // notify the user about the payment failure
        await this.notifyPaymentFailure(session)

        console.error('Payment Failed',{
          sessionId,
          userId:session.client_reference_id,
          courseId:session.metadata?.courseId,
          error:error.message,
        });


        break
      } catch (retryError) {
        retries++
        
        if(retries >= maxRetries){
          console.error('Max retries reached for handling payment failure:',retryError);
          throw new Error('Failed to handle payment failure after multiple attempts')
        }

        // wait before retrying 
        await new Promise(resolve => setTimeout(resolve,1000* Math.pow(2,retries)))
      }
    }
  }
  private async notifyPaymentFailure(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.client_reference_id!;
    const courseId = session.metadata?.courseId!;
    const courseName = session.metadata?.courseName || 'the course';
    const email = session.metadata?.email || 'test@gmail.com'

    const notificationPayload = {
      type: 'PAYMENT_FAILURE_NOTIFICATION',
      payload: {
        email:email,
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
      console.log('transactions in usecase',transactions)
      return transactions;
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  } 
  async getInstructorCoursesTransaction(instructorId:string):Promise<PaymentEntity[]>{
    return await this.paymentRepository.findByInstructorId(instructorId)
  } 
}
