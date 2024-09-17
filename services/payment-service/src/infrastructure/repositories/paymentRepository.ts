import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid'
import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentEntity } from '../../domain/entities/payment';
import { startOfDay, endOfDay } from 'date-fns';

export class PaymentRepositoryImpl implements PaymentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(payment: PaymentEntity): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
  
      // If payment.id is empty, generate a new one
      if (!payment.id || payment.id.trim() === '') {
        payment.id = uuidv4(); // Generate a unique ID
      }
  
      // Check if the payment already exists
      const checkQuery = 'SELECT id FROM payments WHERE id = $1';
      const checkResult = await client.query(checkQuery, [payment.id]);
  
      if (checkResult.rows.length > 0) {
        // Payment already exists, don't insert again
        await client.query('COMMIT');
        return;
      }
  
      // Insert query with new fields included
      const query = `
        INSERT INTO payments (
          id, session_id, stripe_payment_intent_id, user_id, instructor_id, course_id, amount_in_inr, amount_in_usd, 
          admin_amount, instructor_amount, currency, status, 
          admin_account_id, instructor_account_id, admin_payout_status, instructor_payout_status, 
          created_at, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;
      `;
  
      const values = [
        payment.id,
        payment.sessionId,
        payment.stripe_payment_intent_id,
        payment.userId,
        payment.instructorId,
        payment.courseId,
        payment.amountInINR,
        payment.amountInUSD,
        payment.adminAmount,
        payment.instructorAmount,
        payment.currency,
        payment.status,
        payment.adminAccountId || null, // If not provided, insert as null
        payment.instructorAccountId || null, // If not provided, insert as null
        payment.adminPayoutStatus || 'pending', // Default to 'pending' if not provided
        payment.instructorPayoutStatus || 'pending', // Default to 'pending' if not provided
        payment.createdAt,
        payment.updatedAt,
      ];
  
      // Insert and get the saved payment
      const insertResult = await client.query(query, values);
  
      // Commit the transaction
      await client.query('COMMIT');
  
      // Console log the saved payment
      const savedPayment = insertResult.rows[0];
      console.log('Saved payment:', savedPayment);
  
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    } finally {
      client.release();
    }
  }


  async updateStatus(payment_intent_id: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    const query = 'UPDATE payments SET status = $1, updated_at = $2 WHERE stripe_payment_intent_id = $3';
    const values = [status, new Date(), payment_intent_id];

    await this.pool.query(query, values);
  }

  async updateTransferStatus(
    id: string,
    type: 'admin' | 'instructor',
    status: 'pending' | 'completed' | 'failed'
  ): Promise<void> {
    let query: string;

    // Determine which field to update based on the type (admin or instructor)
    if (type === 'admin') {
      query = 'UPDATE payments SET admin_payout_status = $1, updated_at = $2 WHERE id = $3';
    } else if (type === 'instructor') {
      query = 'UPDATE payments SET instructor_payout_status = $1, updated_at = $2 WHERE id = $3';
    } else {
      throw new Error('Invalid transfer type. Must be "admin" or "instructor".');
    }

    const values = [status, new Date(), id];

    try {
      await this.pool.query(query, values);
      console.log(`${type} transfer status updated to ${status} for payment ID ${id}`);
    } catch (error) {
      console.error(`Error updating ${type} transfer status for payment ID ${id}:`, error);
      throw new Error('Failed to update transfer status');
    }
  }

  async findBySessionId(sessionId: string): Promise<PaymentEntity | null> {
    const query = 'SELECT * FROM payments WHERE id = $1';
    const result = await this.pool.query(query, [sessionId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new PaymentEntity(
      '',
      row.session_id,
      row.user_id,
      row.instructor_id,
      row.course_id,
      row.amount_in_inr,
      row.amount_in_usd,
      row.admin_amount,
      row.instructor_amount,
      row.currency,
      row.status,
      row.created_at,
      row.updated_at,
      row.admin_account_id,
      row.instructor_account_id,
      row.admin_payout_status,
      row.instructor_payout_status
    );

  }

  async findPaymentIntentId(userId: string, courseId: string): Promise<PaymentEntity | null> {
    console.log('userid in repo', userId)
    console.log('courseid in repo', courseId)
    const query = 'SELECT * FROM payments WHERE user_id = $1 AND course_id = $2';
    const result = await this.pool.query(query, [userId, courseId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    console.log('refunded payment', row)
    return new PaymentEntity(
      '',
      row.session_id,
      row.stripe_payment_intent_id,
      row.user_id,
      row.instructor_id,
      row.course_id,
      row.amount_in_inr,
      row.amount_in_usd,
      row.admin_amount,
      row.instructor_amount,
      row.currency,
      row.status,
      row.created_at,
      row.updated_at,
      row.admin_account_id,
      row.instructor_account_id,
      row.admin_payout_status,
      row.instructor_payout_status
    );
  }

  async findTransactions(filter: { sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<{ transactions: PaymentEntity[], totalPages: number }> {
    // Default values for pagination and sorting
    const sortBy = filter.sortBy || 'created_at';
    const sortOrder = filter.sortOrder || 'desc';
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    // Construct the SQL query with parameters for fetching transactions
    const transactionsQuery = `
      SELECT * FROM payments
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;
    const transactionsValues = [limit, offset];

    // Construct the SQL query for counting total records
    const countQuery = `SELECT COUNT(*) FROM payments`;

    try {
      // Fetch transactions
      const transactionsResult = await this.pool.query(transactionsQuery, transactionsValues);
      const transactions = transactionsResult.rows.map(row => new PaymentEntity(
        '',
        row.session_id,
        row.user_id,
        row.instructor_id,
        row.course_id,
        row.amount_in_inr,
        row.amount_in_usd,
        row.admin_amount,
        row.instructor_amount,
        row.currency,
        row.status,
        row.created_at,
        row.updated_at,
        row.admin_account_id,
        row.instructor_account_id,
        row.admin_payout_status,
        row.instructor_payout_status
      ));

      // Fetch total count
      const countResult = await this.pool.query(countQuery);
      const totalRecords = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalRecords / limit);

      return { transactions, totalPages };
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async findByInstructorId(instructorId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    const query = `
      SELECT
        id,
        user_id,
        instructor_id,
        course_id,
        amount_in_inr,
        amount_in_usd,
        admin_amount,
        instructor_amount,
        currency,
        status,
        created_at,
        updated_at,
        admin_account_id,
        instructor_account_id,
        admin_payout_status,
        instructor_payout_status
      FROM payments
      WHERE instructor_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const values = [instructorId, limit, offset];  // Pass limit and offset to the query

    try {
      const result = await this.pool.query(query, values);

      return result.rows.map(row => new PaymentEntity(
        '',
        row.session_id,
        row.user_id,
        row.instructor_id,
        row.course_id,
        row.amount_in_inr,
        row.amount_in_usd,
        row.admin_amount,
        row.instructor_amount,
        row.currency,
        row.status,
        row.created_at,
        row.updated_at,
        row.admin_account_id,
        row.instructor_account_id,
        row.admin_payout_status,
        row.instructor_payout_status
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async findByStudentId(studentId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    console.log('find transactions by studentid', studentId)
    const query = `
      SELECT
        id,
        session_id,
        stripe_payment_intent_id,
        user_id,
        instructor_id,
        course_id,
        amount_in_inr,
        amount_in_usd,
        admin_amount,
        instructor_amount,
        currency,
        status,
        created_at,
        updated_at,
        admin_account_id,
        instructor_account_id,
        admin_payout_status,
        instructor_payout_status
      FROM payments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const values = [studentId, limit, offset];

    try {
      const result = await this.pool.query(query, values);

      return result.rows.map(row => new PaymentEntity(
        '',
        row.session_id,
        row.stripe_payment_intent_id,
        row.user_id,
        row.instructor_id,
        row.course_id,
        row.amount_in_inr,
        row.amount_in_usd,
        row.admin_amount,
        row.instructor_amount,
        row.currency,
        row.status,
        row.created_at,
        row.updated_at,
        row.admin_account_id,
        row.instructor_account_id,
        row.admin_payout_status,
        row.instructor_payout_status
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }
  async getTotalTransactionsForInstructor(instructorId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as total
      FROM payments
      WHERE instructor_id = $1
    `;

    const values = [instructorId];

    try {
      const result = await this.pool.query(query, values);

      // The count is returned as a string, so you need to parse it as a number
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error('Error retrieving total transactions:', error);
      throw new Error('Failed to retrieve total transactions');
    }
  }
  async getTotalTransactionsForStudent(studentId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as total
      FROM payments
      WHERE user_id = $1
    `;

    const values = [studentId];

    try {
      const result = await this.pool.query(query, values);

      // The count is returned as a string, so you need to parse it as a number
      return parseInt(result.rows[0].total, 10);
    } catch (error) {
      console.error('Error retrieving total transactions:', error);
      throw new Error('Failed to retrieve total transactions');
    }
  }
  async getTodayRevenueForInstructor(instructorId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const query = `
        SELECT COALESCE(SUM(instructor_amount), 0) AS today_revenue
        FROM payments
        WHERE instructor_id = $1
        AND created_at BETWEEN $2 AND $3;
    `;

    const result = await this.pool.query(query, [instructorId, todayStart, todayEnd]);

    return result.rows[0].today_revenue;
  }

  async getTodayRevenueForAdmin(): Promise<number> {
    const todayStart = startOfDay(new Date())
    const todayEnd = endOfDay(new Date())

    const query = `
      SELECT COALESCE(SUM(admin_amount),0) AS today_revenue
      FROM payments
      WHERE created_at BETWEEN $1 AND $2;
      `;

    const result = await this.pool.query(query, [todayStart, todayEnd])
    return result.rows[0].today_revenue
  }

  // Method to get the total earnings of an instructor
  async getTotalEarningsForInstructor(instructorId: string): Promise<number> {
    const query = `
        SELECT COALESCE(SUM(instructor_amount), 0) AS total_earnings
        FROM payments
        WHERE instructor_id = $1;
    `;

    const result = await this.pool.query(query, [instructorId]);
    return result.rows[0].total_earnings;
  }

  // Method to get the total earnings for the admin
  async getTotalEarningsForAdmin(): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(admin_amount), 0) AS total_earnings
      FROM payments;
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows[0].total_earnings;
    } catch (error) {
      console.error('Error retrieving total earnings for admin:', error);
      throw new Error('Failed to retrieve total earnings for admin');
    }
  }
}
