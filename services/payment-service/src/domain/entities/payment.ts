import { v4 as uuidv4 } from 'uuid'; // Importing a UUID generator

export class PaymentEntity {
  id: string; // ID should always be present
  sessionId: string;
  stripe_payment_intent_id: string;
  userId: string;
  instructorId?: string;
  courseId: string;
  amountInINR?: number; // Amount in INR
  amountInUSD?: number; // Amount in USD
  adminAmount?: number;
  instructorAmount?: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  adminAccountId?: string; // Stripe account ID for the admin (where admin amount goes)
  instructorAccountId?: string; // Stripe account ID for the instructor (where instructor amount goes)
  adminPayoutStatus?: 'pending' | 'completed' | 'failed'; 
  instructorPayoutStatus?: 'pending' | 'completed' | 'failed';

  constructor(
    id: string = uuidv4(),
    sessionId: string,
    stripe_payment_intent_id: string,
    userId: string,
    instructorId: string,
    courseId: string,
    amountInINR: number,
    amountInUSD: number,
    adminAmount: number,
    instructorAmount: number,
    currency: string,
    status: 'pending' | 'completed' | 'failed',
    createdAt: Date = new Date(), // Default to current date
    updatedAt: Date = new Date(), // Default to current date
    adminAccountId?: string, // Make optional
    instructorAccountId?: string, // Make optional
    adminPayoutStatus?: 'pending' | 'completed' | 'failed',
    instructorPayoutStatus?: 'pending' | 'completed' | 'failed',
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.stripe_payment_intent_id = stripe_payment_intent_id;
    this.userId = userId;
    this.instructorId = instructorId;
    this.courseId = courseId;
    this.amountInINR = amountInINR;
    this.amountInUSD = amountInUSD;
    this.adminAmount = adminAmount;
    this.instructorAmount = instructorAmount;
    this.currency = currency;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.adminAccountId = adminAccountId;
    this.instructorAccountId = instructorAccountId;
    this.adminPayoutStatus = adminPayoutStatus; 
    this.instructorPayoutStatus = instructorPayoutStatus; 
  }
}