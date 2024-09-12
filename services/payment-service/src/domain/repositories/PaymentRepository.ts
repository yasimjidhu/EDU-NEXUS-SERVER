import { PaymentEntity } from "../entities/payment";

export interface PaymentRepository {
    create(payment: PaymentEntity): Promise<void>;
    updateStatus(id: string, status: 'pending' | 'completed' | 'failed'|'refunded'): Promise<void>;
    findBySessionId(sessionId:string):Promise<PaymentEntity | null>
    findByInstructorId(instructorId:string,limit:number,offset:number):Promise<PaymentEntity[]>
    getTotalTransactionsForInstructor(instructorId: string): Promise<number>
    findTransactions(filter: any): Promise<PaymentEntity[]>;
    updateTransferStatus(id: string,type: 'admin' | 'instructor',status: 'pending' | 'completed' | 'failed'): Promise<void> 
    getTodayRevenueForInstructor(instructorId:string):Promise<number>
    getTodayRevenueForAdmin():Promise<number>
    getTotalEarningsForInstructor(instructorId:string):Promise<number>
    getTotalEarningsForAdmin():Promise<number>
  }