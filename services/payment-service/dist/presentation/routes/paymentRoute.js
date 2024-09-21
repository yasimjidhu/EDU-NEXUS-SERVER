"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const paymentDb_1 = __importDefault(require("../../infrastructure/database/paymentDb"));
const paymentUseCase_1 = require("../../application/usecases/paymentUseCase");
const paymentRepository_1 = require("../../infrastructure/repositories/paymentRepository");
const paymentController_1 = require("../controllers/paymentController");
const producer_1 = require("../../infrastructure/messaging/kafka/producer");
const authenticationMiddleware_1 = require("../middlewares/authenticationMiddleware");
const authorizationMiddleware_1 = require("../middlewares/authorizationMiddleware");
const stripeService_1 = require("../../infrastructure/services/stripeService");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
// messaging
const producer = new producer_1.KafkaProducer();
exports.stripe = new stripe_1.default(stripeSecretKey, { apiVersion: '2024-06-20' });
const stripeService = new stripeService_1.StripeService(exports.stripe);
const paymentRepository = new paymentRepository_1.PaymentRepositoryImpl(paymentDb_1.default);
const paymentUseCase = new paymentUseCase_1.PaymentUseCase(paymentRepository, exports.stripe, producer, stripeService);
const paymentController = new paymentController_1.PaymentController(paymentUseCase);
const router = (0, express_1.Router)();
// payment endpoints
router.post('/create-account-link', paymentController.createConnectedAccount.bind(paymentController));
router.get('/complete-onboarding/:accountId', authenticationMiddleware_1.authMiddleware, paymentController.handleOnboardingCompletion.bind(paymentController));
router.post('/create-checkout-session', authenticationMiddleware_1.authMiddleware, paymentController.createCheckoutSession.bind(paymentController));
router.post('/complete-purchase', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.studentMiddleware, paymentController.completePurchase.bind(paymentController));
router.post('/refund', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.studentMiddleware, paymentController.requestRefund.bind(paymentController));
router.get('/find-transactions', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.adminMiddleware, paymentController.findTransactions.bind(paymentController));
router.get('/find-transactions/:instructorId', authenticationMiddleware_1.authMiddleware, paymentController.findInstructorCoursesTransaction.bind(paymentController));
router.get('/find-transaction/:userId', authenticationMiddleware_1.authMiddleware, paymentController.findStudentrCoursesTransaction.bind(paymentController));
router.get('/todays-revenue', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.adminMiddleware, paymentController.getTodaysAdminRevenue.bind(paymentController));
router.get('/todays-revenue/:instructorId', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.instructorMiddleware, paymentController.getTodayRevenue.bind(paymentController));
router.get('/total-earnings', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.adminMiddleware, paymentController.getTotalEarningsOfAdmin.bind(paymentController));
router.get('/total-earnings/:instructorId', authenticationMiddleware_1.authMiddleware, authorizationMiddleware_1.instructorMiddleware, paymentController.getTotalEarnings.bind(paymentController));
exports.default = router;
