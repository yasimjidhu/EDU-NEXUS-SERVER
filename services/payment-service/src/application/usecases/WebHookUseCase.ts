import Stripe from 'stripe';
import { PayoutRepository } from '../../domain/repositories/payoutRepostory';

export class StripeWebhookUseCase {
  private payoutRepository: PayoutRepository;

  constructor(payoutRepository:PayoutRepository) {
    this.payoutRepository = payoutRepository
  }

  async processEvent(event: Stripe.Event) {
    console.log('event type of webhook is', event.type);
    switch (event.type) {
      case 'payout.paid':
        const payoutPaid = event.data.object as Stripe.Payout;
        await this.handlePayoutPaid(payoutPaid);
        break;
  
      case 'payout.failed':
        const payoutFailed = event.data.object as Stripe.Payout;
        await this.handlePayoutFailed(payoutFailed);
        break;
  
      case 'payout.canceled':
        const payoutCanceled = event.data.object as Stripe.Payout;
        await this.handlePayoutCanceled(payoutCanceled);
        break;
  
      case 'payout.updated':
        const payoutUpdated = event.data.object as Stripe.Payout;
        await this.handlePayoutUpdated(payoutUpdated);
        break;
  
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
  

  async handlePayoutPaid(payout: Stripe.Payout) {
    // Update payout status to "completed"
    await this.payoutRepository.updatePayoutStatus(payout.id, 'completed');
  }

  async handlePayoutFailed(payout: Stripe.Payout) {
    // Update payout status to "failed"
    await this.payoutRepository.updatePayoutStatus(payout.id, 'failed');
    // Notify the user about the failed payout (you can add notification logic here)
  }

  async handlePayoutCanceled(payout: Stripe.Payout) {
    // Update payout status to "cancelled"
    await this.payoutRepository.updatePayoutStatus(payout.id, 'cancelled');
  }

  async handlePayoutUpdated(payout: Stripe.Payout) {
    // Handle updates to the payout details
    await this.payoutRepository.updatePayoutDetails(payout.id, payout);
  }
}