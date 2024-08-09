"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
class PaymentController {
    paymentUseCase;
    constructor(paymentUseCase) {
        this.paymentUseCase = paymentUseCase;
    }
    async createCheckoutSession(req, res) {
        try {
            const result = await this.paymentUseCase.createCheckoutSession(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async completePurchase(req, res) {
        const { sessionId } = req.body;
        try {
            const result = await this.paymentUseCase.create(sessionId);
            res.status(200).json({ result, success: true });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.PaymentController = PaymentController;
