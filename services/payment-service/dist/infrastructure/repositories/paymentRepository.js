"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepositoryImpl = void 0;
const payment_1 = require("../../domain/entities/payment");
class PaymentRepositoryImpl {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async create(payment) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const checkQuery = 'SELECT id from payments WHERE id = $1';
            const checkResult = await client.query(checkQuery, [payment.id]);
            if (checkResult.rows.length > 0) {
                // payment already exist , dont insert again
                await client.query('COMMIT');
                return;
            }
            const query = `
      INSERT INTO payments (id, user_id, course_id, amount, currency, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
            const values = [
                payment.id,
                payment.userId,
                payment.courseId,
                payment.amount,
                payment.currency,
                payment.status,
                payment.createdAt,
                payment.updatedAt
            ];
            await this.pool.query(query, values);
            await client.query('COMMIT');
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.log(error);
            throw new Error('Failed to create payment');
        }
        finally {
            client.release();
        }
    }
    async updateStatus(id, status) {
        const query = 'UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3';
        const values = [status, new Date(), id];
        await this.pool.query(query, values);
    }
    async findBySessionId(sessionId) {
        const query = 'SELECT * FROM payments WHERE id = $1';
        const result = await this.pool.query(query, [sessionId]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return new payment_1.PaymentEntity(row.user_id, row.course_id, row.amount, row.currency, row.status, row.created_at, row.updated_at, row.id);
    }
}
exports.PaymentRepositoryImpl = PaymentRepositoryImpl;
