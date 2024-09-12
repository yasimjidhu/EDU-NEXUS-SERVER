import { UserRepository } from "../../infrastructure/repositories/user";
import { IKycUseCase } from "../interface/IKycUseCase";
import { Stripe } from 'stripe';

export class KycUseCase implements IKycUseCase {
    private userRepository: UserRepository;
    private stripe: Stripe;

    constructor(userRepository: UserRepository, stripe: Stripe) {
        this.userRepository = userRepository;
        this.stripe = stripe;
    }

    async execute(instructorId: string): Promise<{ verificationSessionId: string; verificationUrl: string }> {
        const instructor = await this.userRepository.findById(instructorId);

        if (!instructor) {
            throw new Error('Instructor not found');
        }

        const { verificationSessionId, verificationUrl } = await this.initiateVerification(instructorId);
        instructor.verificationSessionId = verificationSessionId;

        await this.userRepository.update(instructor); 

        return { verificationSessionId, verificationUrl }; 
    }

    async initiateVerification(instructorId: string): Promise<{ verificationSessionId: string; verificationUrl: string }> {
        const session = await this.stripe.identity.verificationSessions.create({
            type: 'document',
            metadata: { instructorId }
        });

        return {
            verificationSessionId: session.id,
            verificationUrl: session.url
        };
    }

    async processWebhook(event: { data: { object: any } }): Promise<void> {
        const session = event.data.object;

        const instructor = await this.userRepository.findByVerificationSessionId(session.id);
        if (!instructor) {
            throw new Error('Instructor not found for session');
        }

        if (session.status === 'verified') {
            instructor.isVerified = true;
        } else if (session.status === 'requires_input') {
            instructor.isVerified = false;
        }

        await this.userRepository.update(instructor); // Assuming update doesn't return a value
    }
}