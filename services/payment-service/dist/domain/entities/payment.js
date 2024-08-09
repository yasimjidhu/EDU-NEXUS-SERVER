"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEntity = void 0;
const uuid_1 = require("uuid"); // Importing a UUID generator
class PaymentEntity {
    id;
    sessionId;
    userId;
    courseId;
    amount;
    currency;
    status;
    createdAt;
    updatedAt;
    constructor(sessionId, userId, courseId, amount, currency, status, createdAt, updatedAt, id = (0, uuid_1.v4)()) {
        this.id = id;
        this.sessionId = sessionId;
        this.userId = userId;
        this.courseId = courseId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.PaymentEntity = PaymentEntity;
