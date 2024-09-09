import { PaymentEntity } from "../../domain/entities/payment";

export interface IPaymentRepository {
  create(payment: PaymentEntity): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByUserId(userId: string): Promise<PaymentEntity[]>;
  update(payment: PaymentEntity): Promise<PaymentEntity>;
  updateTransferStatus(id: string,type: 'admin' | 'instructor',status: 'pending' | 'completed' | 'failed'): Promise<void> 
}