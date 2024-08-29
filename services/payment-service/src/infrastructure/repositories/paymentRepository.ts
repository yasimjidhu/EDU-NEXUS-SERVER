import { Pool } from 'pg';
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentEntity } from '../../domain/entities/payment';

export class PaymentRepositoryImpl implements PaymentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(payment: PaymentEntity): Promise<void> {
    const client = await this.pool.connect();
  
    try {
      await client.query('BEGIN');
  
      const checkQuery = 'SELECT id FROM payments WHERE id = $1';
      const checkResult = await client.query(checkQuery, [payment.id]);
  
      if (checkResult.rows.length > 0) {
        // Payment already exists, don't insert again
        await client.query('COMMIT');
        return;
      }
  
      // Calculate the amounts to be distributed
      const adminAmount = Math.round(payment.amount * 0.3);
      const instructorAmount = Math.round(payment.amount * 0.7);
  
      const query = `
        INSERT INTO payments (
          id, user_id,instructor_id, course_id, amount, currency, status, created_at, updated_at, admin_amount, instructor_amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
  
      const values = [
        payment.id,
        payment.userId,
        payment.instructorId,
        payment.courseId,
        payment.amount,
        payment.currency,
        payment.status,
        payment.createdAt,
        payment.updatedAt,
        adminAmount,
        instructorAmount
      ];
  
      await client.query(query, values);
  
      await client.query('COMMIT');
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.log(error);
      throw new Error('Failed to create payment');
    } finally {
      client.release();
    }
  }
  

  async updateStatus(id: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    const query = 'UPDATE payments SET status = $1, updated_at = $2 WHERE id = $3';
    const values = [status, new Date(), id];

    await this.pool.query(query, values);
  }
  async findBySessionId(sessionId: string): Promise<PaymentEntity | null> {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await this.pool.query(query, [sessionId]);
  
    if (result.rows.length === 0) {
      return null;
    }
  
    const row = result.rows[0];
    return new PaymentEntity(
      row.user_id,
      row.instructor_id,
      row.course_id,
      row.amount,
      row.admin_amount,
      row.instructor_amount,
      row.currency,
      row.status,
      row.created_at,
      row.updated_at,
      row.id,
    );
  }
  async findTransactions(filter: { sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<PaymentEntity[]> {
    // Default values for pagination and sorting
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    // Construct the SQL query with parameters
    const query = `
      SELECT * FROM payments
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const values = [limit, offset];

    try {
      const result = await this.pool.query(query, values);
      
      return result.rows.map(row => new PaymentEntity(
        row.id,
        row.user_id,
        row.instructor_id,
        row.course_id,
        row.amount,
        row.admin_amount,
        row.instructor_amount,
        row.currency,
        row.status,
        row.created_at,
        row.updated_at
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }
  async findByInstructorId(instructorId: string): Promise<PaymentEntity[]> {
    const query = `
      SELECT
        id,
        user_id,
        instructor_id,
        course_id,
        amount,
        admin_amount,
        instructor_amount,
        currency,
        status,
        created_at,
        updated_at
      FROM payments
      WHERE instructor_id = $1
      ORDER BY created_at DESC
    `;
    const values = [instructorId];

    try {
      const result = await this.pool.query(query, values);
      
      return result.rows.map(row => new PaymentEntity(
        row.id,
        row.user_id,
        row.instructor_id,
        row.course_id,
        row.amount,
        row.admin_amount,
        row.instructor_amount,
        row.currency,
        row.status,
        row.created_at,
        row.updated_at, 
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

}
