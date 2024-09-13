import Stripe from 'stripe';
import { UserRepository } from '../../infrastructure/repositories/user';
import { UserRepositoryImpl } from '../../infrastructure/repositories/UserImpl'; 
import { sendKycVerificationSuccessMessage } from '../../infrastructure/kafka/kafkaService';

export class ProcessStripeWebhook {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepositoryImpl();
  }

  async execute(event: Stripe.Event) {
    switch (event.type) {
      case 'identity.verification_session.verified': {
        const verificationSession = event.data.object as Stripe.Identity.VerificationSession;
        console.log(`Verification session completed for ${verificationSession.id}`);
        
        if (verificationSession.status === 'verified') {
          // Update KYC status in the repository
          const instructorId = verificationSession.metadata.instructorId;
          if (instructorId) {
            const updatedUser = await this.userRepository.updateKYCStatus(instructorId, 'verified');
            await sendKycVerificationSuccessMessage(updatedUser.email)
          }
        }
        break;
      }

      // Handle other webhook events
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
