"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEntity = void 0;
class PaymentEntity {
    id;
    userId;
    courseId;
    amount;
    currency;
    status;
    createdAt;
    updatedAt;
    constructor(userId, courseId, amount, currency, status, createdAt, updatedAt, id) {
        this.id = id;
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
