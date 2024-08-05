"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
class PaymentController {
    paymentUseCase;
    constructor(paymentUseCase) {
        this.paymentUseCase = paymentUseCase;
    }
    async createPaymentIntent(req, res) {
        const { userId, courseId, amount, currency } = req.body;
        try {
            const result = await this.paymentUseCase.createPaymentIntent(userId, courseId, amount, currency);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async updatePaymentStatus(req, res) {
        const { id } = req.params;
        const status = req.body;
        try {
            await this.paymentUseCase.updatePaymentStatus(id, status);
            res.status(200).json({ message: 'Payment status updated' });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.PaymentController = PaymentController;
