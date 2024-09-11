
import { PayoutRepository } from "../../domain/repositories/payoutRepostory";
import Stripe from "stripe";
import { sendVerificationNotification } from "../../infrastructure/messaging/service";

export class PayoutUseCase {
  private payoutRepository: PayoutRepository;
  private stripe :Stripe

  constructor(payoutRepository: PayoutRepository,stripe:Stripe) {
    this.payoutRepository = payoutRepository;
    this.stripe = stripe
  }
  
  async requestAdminPayout(paymentId: string, accountId: string, amount: number, currency: string) {
    try {
      const payout = await this.stripe.payouts.create({
        amount,
        currency,
        destination: accountId,
        description: `Admin payout for payment ${paymentId}`
      });

      await this.payoutRepository.createPayout({
        paymentId,
        accountType: 'admin',
        accountId,
        amount,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return payout;
    } catch (error) {
      console.error('Error requesting admin payout:', error);
      throw new Error('Failed to request admin payout');
    }
  }

  async fetchExternalAccountId(connectedAccountId: string): Promise<string> {
    const account = await this.stripe.accounts.retrieve(connectedAccountId);
    const externalAccounts = account?.external_accounts?.data;
  
    // Ensure there are external accounts and return the first one
    if ( externalAccounts &&  externalAccounts.length > 0) {
      console.log('external accounts',externalAccounts[0].id)
      return externalAccounts[0].id; // or return the specific account based on your logic
    } else {
      throw new Error('No external accounts found for this connected account.');
    }
  }

  async requestInstructorPayout(paymentId: string, connectedAccountId: string, amount: number, currency: string, email: string) {
    try {
        // Check if the account is verified before proceeding with the payout
        await this.checkAccountVerification(connectedAccountId, email);

        // Fetch the external account ID
        const externalAccountId = await this.fetchExternalAccountId(connectedAccountId);
        console.log('type of external accoutnid',typeof(externalAccountId))
        console.log('External account ID:', externalAccountId);

        // Create payout
        const payout = await this.stripe.payouts.create({
            amount,
            currency,
            destination: externalAccountId.trim(),
            description: `Instructor payout for payment ${paymentId}`
        });

        // Record payout details in the repository
        await this.payoutRepository.createPayout({
            paymentId,
            accountType: 'instructor',
            accountId: externalAccountId,
            amount,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return payout;
    } catch (error) {
        console.error('Error requesting instructor payout:', error);
        throw new Error('Failed to request instructor payout');
    }
}

  async getAvailablePayoutsForInstructor(instructorId: string): Promise<number>{
    return await this.payoutRepository.getAvailablePayoutsForInstructor(instructorId)
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
