"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentUseCase = void 0;
const payment_1 = require("../../domain/entities/payment");
class PaymentUseCase {
    paymentRepository;
    stripe;
    constructor(paymentRepository, stripe) {
        this.paymentRepository = paymentRepository;
        this.stripe = stripe;
    }
    async createPaymentIntent(userId, courseId, amount, currency) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency,
        });
        //store payment intent in the repository
        const payment = new payment_1.PaymentEntity(userId, courseId, amount, currency, 'pending', new Date(), new Date(), paymentIntent.id);
        await this.paymentRepository.create(payment);
        return { clientSecret: paymentIntent.client_secret };
    }
    async updatePaymentStatus(id, status) {
        await this.paymentRepository.updateStatus(id, status);
    }
}
exports.PaymentUseCase = PaymentUseCase;
