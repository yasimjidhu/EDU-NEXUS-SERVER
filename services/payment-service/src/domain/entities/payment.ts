import { v4 as uuidv4 } from 'uuid'; // Importing a UUID generator

export class PaymentEntity {
  id?: string;
  sessionId: string;
  userId: string;
  instructorId?: string;
  courseId: string;
  amount: number;
  adminAmount: number;
  instructorAmount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  adminAccountId?: string;
  instructorAccountId?: string;
  adminPayoutStatus?: 'pending' | 'completed' | 'failed'; 
  instructorPayoutStatus?: 'pending' | 'completed' | 'failed';

  constructor(
    sessionId: string,
    userId: string,
    instructorId: string,
    courseId: string,
    amount: number,
    adminAmount: number,
    instructorAmount: number,
    currency: string,
    status: 'pending' | 'completed' | 'failed',
    createdAt: Date,
    updatedAt: Date,
    adminAccountId?: string, // Make optional
    instructorAccountId?: string, // Make optional
    adminPayoutStatus?: 'pending' | 'completed' | 'failed',
    instructorPayoutStatus?: 'pending' | 'completed' | 'failed',
    id: string = uuidv4()
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.userId = userId;
    this.instructorId = instructorId;
    this.courseId = courseId;
    this.amount = amount;
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