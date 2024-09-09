import { PaymentEntity } from "../entities/payment";

export interface PaymentRepository {
    create(payment: PaymentEntity): Promise<void>;
    updateStatus(id: string, status: 'pending' | 'completed' | 'failed'|'refunded'): Promise<void>;
    findBySessionId(sessionId:string):Promise<PaymentEntity | null>
    findByInstructorId(instructorId:string):Promise<PaymentEntity[]>
    findTransactions(filter: any): Promise<PaymentEntity[]>;
    updateTransferStatus(id: string,type: 'admin' | 'instructor',status: 'pending' | 'completed' | 'failed'): Promise<void> 
  }