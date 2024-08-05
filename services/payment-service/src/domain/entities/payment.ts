import { v4 as uuidv4 } from 'uuid'; // Importing a UUID generator

export class PaymentEntity {
    id?: string;
    sessionId: string;
    userId: string;
    courseId:string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
  
    constructor(
      sessionId: string,
      userId: string,
      courseId: string,
      amount: number,
      currency: string,
      status: 'pending' | 'completed' | 'failed',
      createdAt: Date,
      updatedAt: Date,
      id: string = uuidv4()
    ) {
      this.id = id;
      this.sessionId = sessionId;
      this.userId = userId;
      this.courseId = courseId;
      this.amount = amount;
      this.currency = currency;
      this.status = status;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  }
  