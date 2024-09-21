"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEntity = void 0;
const uuid_1 = require("uuid"); // Importing a UUID generator
class PaymentEntity {
    id; // ID should always be present
    sessionId;
    stripe_payment_intent_id;
    userId;
    instructorId;
    courseId;
    amountInINR; // Amount in INR
    amountInUSD; // Amount in USD
    adminAmount;
    instructorAmount;
    currency;
    status;
    createdAt;
    updatedAt;
    adminAccountId; // Stripe account ID for the admin (where admin amount goes)
    instructorAccountId; // Stripe account ID for the instructor (where instructor amount goes)
    adminPayoutStatus;
    instructorPayoutStatus;
    constructor(id = (0, uuid_1.v4)(), sessionId, stripe_payment_intent_id, userId, instructorId, courseId, amountInINR, amountInUSD, adminAmount, instructorAmount, currency, status, createdAt = new Date(), // Default to current date
    updatedAt = new Date(), // Default to current date
    adminAccountId, // Make optional
    instructorAccountId, // Make optional
    adminPayoutStatus, instructorPayoutStatus) {
        this.id = id;
        this.sessionId = sessionId;
        this.stripe_payment_intent_id = stripe_payment_intent_id;
        this.userId = userId;
        this.instructorId = instructorId;
        this.courseId = courseId;
        this.amountInINR = amountInINR;
        this.amountInUSD = amountInUSD;
        this.adminAmount = adminAmount;
        this.instructorAmount = instructorAmount;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.adminAccountId = adminAccountId;
        this.instructorAccountId = instructorAccountId;
        this.adminPayoutStatus = adminPayoutStatus;
        this.instructorPayoutStatus = instructorPayoutStatus;
    }
}
exports.PaymentEntity = PaymentEntity;
