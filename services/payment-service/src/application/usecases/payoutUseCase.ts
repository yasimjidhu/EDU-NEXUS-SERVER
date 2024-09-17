
import Stripe from "stripe";
import { sendVerificationNotification } from "../../infrastructure/messaging/service";

export class PayoutUseCase {
  private stripe: Stripe

  constructor(stripe: Stripe) {
    this.stripe = stripe
  }

  async initiateAdminPayout(): Promise<void> {
    const balance = await this.getAvailableBalance()
    await this.createAdminPayout(balance, 'usd')
  }

  // Get available balance for admin payout
  async getAvailableBalance(): Promise<number> {
    const balance = await this.stripe.balance.retrieve();
    return balance.available[0]?.amount || 0; // amount in cents
  }

  // Create a payout for admin
  async createAdminPayout(amount: number, currency: string): Promise<Stripe.Payout | null> {
    if (amount <= 0) {
      console.log('No available balance for payout.');
      return null;
    }

    try {
      const payout = await this.stripe.payouts.create({
        amount,
        currency,
        method: 'standard', // or 'instant'
      });
      return payout;
    } catch (error) {
      console.error('Error creating admin payout:', error);
      return null;
    }
  }

  // Get payout by payoutId
  async getPayoutById(payoutId: string): Promise<Stripe.Payout | null> {
    try {
      const payout = await this.stripe.payouts.retrieve(payoutId);
      return payout;
    } catch (error) {
      console.error('Error fetching payout:', error);
      return null;
    }
  }

  // List all payouts for admin
  async listPayouts(limit: number = 10): Promise<Stripe.ApiList<Stripe.Payout>> {
    return this.stripe.payouts.list({ limit });
  }

  async getAvailablePayoutsForAdmin(adminStripeAccountId:string): Promise<number> {

    try {
      const payouts = await this.stripe.payouts.list({
         limit: 100,
        },{
          stripeAccount:adminStripeAccountId
        });
        
      // Sum available payouts
      const availablePayouts = payouts.data
        .filter(payout => payout.status === 'paid')
        .reduce((total, payout) => total + payout.amount, 0);
      return availablePayouts / 100; // Convert cents to dollars
    } catch (error) {
      console.error('Error fetching available payouts for admin:', error);
      throw new Error('Unable to fetch available payouts for admin.');
    }
  }

  async  getInstructorTotalPayouts(connectedAccountId: string): Promise<number> {
    try {
      const payouts = await this.stripe.payouts.list({
        limit: 100,  // Adjust as needed
      }, {
        stripeAccount: connectedAccountId,
      });
  
      const grossPayouts = payouts.data.reduce((total, payout) => {
        return total + payout.amount;  // Sum all the amounts (in cents)
      }, 0);
    
      return  grossPayouts / 100 
    } catch (error) {
      console.error('Error fetching payouts from Stripe:', error);
      throw new Error('Unable to fetch payouts for instructor.');
    }
  }
  
  async checkAccountVerification(accountId: string, email: string): Promise<void> {
    try {
      // Retrieve the account details
      const account = await this.stripe.accounts.retrieve(accountId);

      // Access verification information correctly
      const requirements = account.requirements

      if (requirements) {
        const currentlyDue = requirements.currently_due;
        if (currentlyDue && currentlyDue.length > 0) {
          console.log('Verification required for the following fields:', currentlyDue);
          // Notify the account holder
          await sendVerificationNotification(email, currentlyDue);
        } else {
          console.log('No additional verification required.');
        }
      } else {
        console.log('No verification information found.');
      }
    } catch (error) {
      console.error('Error retrieving account verification status:', error);
    }
  }

}
