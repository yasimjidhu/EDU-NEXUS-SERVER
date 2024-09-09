import axios from 'axios';
import Stripe from 'stripe';
import { notifyUserService } from '../messaging/service';

export class StripeService {
    private stripe: Stripe;

    constructor(stripe:Stripe) {
        this.stripe = stripe
    }

    // The method should be async to handle async operations inside
    async createConnectedAccount(instructorId: string, email: string): Promise<Stripe.Account> {
        try {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: 'US', // Adjust to your instructor's country
                email: email,
                business_type: 'individual',
                capabilities: {
                    transfers: { requested: true },
                },
            });

            // Store the instructor's Stripe account ID in the database for future reference
            await this.saveStripeAccountIdToUserService(instructorId, account.id);
            console.log('stripe account id saved in user service')
            return account;
        } catch (error) {
            console.error('Error creating connected account:', error);
            throw new Error('Failed to create connected account');
        }
    }

    // Method to save the Stripe account ID by calling the User Service API
    async saveStripeAccountIdToUserService(instructorId: string, stripeAccountId: string) {
        try {
          // Correct URL according to your user service route
          const response = await axios.post(`http://localhost:4000/user/save-stripe-id/${instructorId}`, {
            stripeAccountId
          });
          return response.data;
        } catch (error) {
          console.error('Error saving Stripe account ID to user service:', error);
          throw new Error('Failed to save Stripe account ID');
        }
      }
      

    async createAccountLink(accountId: string): Promise<string> {
        try {
            const accountLink = await this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${process.env.FRONTEND_URL}/reauthenticate`,
                return_url: `${process.env.FRONTEND_URL}/home`,
                type: 'account_onboarding',
            });

            return accountLink.url;
        } catch (error) {
            console.error('Error creating account link:', error);
            throw new Error('Failed to create account link');
        }
    }
    async checkAccountStatus(accountId: string): Promise<any> {
        try {
            // Retrieve the account information from Stripe
            const account = await this.stripe.accounts.retrieve(accountId);
    
            // Check if the account is ready for charging
            if (account.charges_enabled) {
                console.log('Account is fully set up, payments can be received.');
                // Update the instructor's account status in the database
                await notifyUserService(accountId, true);
    
                // Redirect to the dashboard or update the UI
                console.log('Redirecting to the dashboard...');
                // Call your frontend to redirect or update 
                
                return 'Account is fully set up, payments can be received.'
                
            } else if (account.details_submitted) {
                console.log('Account details have been submitted but not fully approved yet.');
               
                // Update the instructor's account status to reflect under-review state
                await notifyUserService(accountId, false);
                return 'your account is under review, it will take some time'
            } else {
                console.log('Account setup is incomplete. More steps are required.');
                console.log('Pending requirements:', account.requirements);
                
                return account.requirements
                // Redirect them to a page to complete setup if necessary
            }
    
        } catch (error) {
            console.error('Error retrieving account:', error);
            throw new Error('Failed to retrieve account status');
        }
    }
    
    async  handleOnboardingCompletion(accountId: string): Promise<void> {
        try {
            // After onboarding, check the account status
            await this.checkAccountStatus(accountId);
    
            // Redirect to the dashboard or appropriate page based on the account status
            console.log('Redirecting to the dashboard...');
        } catch (error) {
            console.error('Error during onboarding completion:', error);
        }
    }
    
}
