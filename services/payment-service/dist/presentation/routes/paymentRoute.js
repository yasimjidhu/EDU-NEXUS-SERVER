"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const paymentDb_1 = __importDefault(require("../../infrastructure/database/paymentDb"));
const paymentUseCase_1 = require("../../application/usecases/paymentUseCase");
const paymentRepository_1 = require("../../infrastructure/repositories/paymentRepository");
const paymentController_1 = require("../controllers/paymentController");
const producer_1 = require("../../infrastructure/messaging/kafka/producer");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
// messaging
const producer = new producer_1.KafkaProducer();
const stripe = new stripe_1.default(stripeSecretKey, { apiVersion: '2024-06-20' });
const paymentRepository = new paymentRepository_1.PaymentRepositoryImpl(paymentDb_1.default);
const paymentUseCase = new paymentUseCase_1.PaymentUseCase(paymentRepository, stripe, producer);
const paymentController = new paymentController_1.PaymentController(paymentUseCase);
exports.router = (0, express_1.Router)();
exports.router.post('/create-checkout-session', paymentController.createCheckoutSession.bind(paymentController));
exports.router.post('/complete-purchase', paymentController.completePurchase.bind(paymentController));
exports.router.get('/find-transactions', paymentController.findTransactions.bind(paymentController));
