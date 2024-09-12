
import { PayoutEntity } from "../entities/payout";

export interface PayoutRepository {
  createPayout(payout: PayoutEntity): Promise<void>;
  updatePayoutStatus(payoutId: string, status: string):Promise<void>
  updatePayoutDetails(payoutId: string, payoutDetails: any):Promise<void>
  getPayoutById(payoutId: number): Promise<PayoutEntity | null>
  getPayoutsByPaymentId(paymentId: string): Promise<PayoutEntity[]>
  getAvailablePayoutsForInstructor(instructorId: string): Promise<number>
  getAvailablePayoutsForAdmin(): Promise<number>
}
