import { PaymentEntity } from "../entities/payment";

export interface PaymentRepository {
    create(payment: PaymentEntity): Promise<void>;
    updateStatus(id: string, status: 'pending' | 'completed' | 'failed'|'refunded'): Promise<void>;
    findBySessionId(sessionId:string):Promise<PaymentEntity | null>
  }