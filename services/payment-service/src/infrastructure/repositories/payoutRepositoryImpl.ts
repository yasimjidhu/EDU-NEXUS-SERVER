// src/infrastructure/repositories/PayoutRepositoryImpl.ts
import { Pool } from 'pg';
import { PayoutRepository } from '../../domain/repositories/payoutRepostory';
import { PayoutEntity } from '../../domain/entities/payout';

export class PayoutRepositoryImpl implements PayoutRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async createPayout(payout: PayoutEntity): Promise<void> {
    const client = await this.pool.connect();

    try {
      const query = `
        INSERT INTO payouts (
          payment_id, account_type, account_id, amount, status, created_at, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const values = [
        payout.paymentId,
        payout.accountType,
        payout.accountId,
        payout.amount,
        payout.status,
        payout.createdAt,
        payout.updatedAt,
      ];

      await client.query(query, values);
    } catch (error) {
      console.error('Error creating payout:', error);
      throw new Error('Failed to create payout');
    } finally {
      client.release();
    }
  }

  async updatePayoutStatus(payoutId: string, status: string): Promise<void> {
    const client = await this.pool.connect();

    try {
      const query = `
        UPDATE payouts SET status = $1, updated_at = $2 WHERE id = $3
      `;
      const values = [status, new Date(), payoutId];
      await client.query(query, values);
    } catch (error) {
      console.error('Error updating payout status:', error);
      throw new Error('Failed to update payout status');
    } finally {
      client.release();
    }
  }

  async getPayoutById(payoutId: number): Promise<PayoutEntity | null> {
    const client = await this.pool.connect();

    try {
      const query = 'SELECT * FROM payouts WHERE id = $1';
      const result = await client.query(query, [payoutId]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return new PayoutEntity(
        row.payment_id,
        row.account_type,
        row.account_id,
        row.amount,
        row.status
      );
    } finally {
      client.release();
    }
  }

  async getPayoutsByPaymentId(paymentId: string): Promise<PayoutEntity[]> {
    const client = await this.pool.connect();

    try {
      const query = 'SELECT * FROM payouts WHERE payment_id = $1';
      const result = await client.query(query, [paymentId]);

      return result.rows.map(row => new PayoutEntity(
        row.payment_id,
        row.account_type,
        row.account_id,
        row.amount,
        row.status
      ));
    } finally {
      client.release();
    }
  }
  async updatePayoutDetails(payoutId: string, updatedPayout: Partial<PayoutEntity>): Promise<void> {
    const client = await this.pool.connect();

    try {
      const query = `
        UPDATE payouts 
        SET 
          account_type = COALESCE($1, account_type),
          account_id = COALESCE($2, account_id),
          amount = COALESCE($3, amount),
          status = COALESCE($4, status),
          updated_at = $5
        WHERE payment_id = $6
      `;

      const values = [
        updatedPayout.accountType,
        updatedPayout.accountId,
        updatedPayout.amount,
        updatedPayout.status,
        new Date(), // always update `updated_at` field
        payoutId
      ];

      await client.query(query, values);
    } catch (error) {
      console.error('Error updating payout details:', error);
      throw new Error('Failed to update payout details');
    } finally {
      client.release();
    }
  }
  async getAvailablePayoutsForInstructor(instructorId: string): Promise<number> {
    const query = `
      SELECT 
        SUM(instructor_amount) AS available_payouts
      FROM payments
      WHERE instructor_id = $1 AND instructor_payout_status = 'pending';
    `;
    const values = [instructorId];
  
    try {
      const result = await this.pool.query(query, values);
      const availablePayouts = result.rows[0].available_payouts || 0; // Handle null values
  
      return availablePayouts;
    } catch (error) {
      console.error('Error retrieving available payouts:', error);
      throw new Error('Failed to retrieve available payouts');
    }
  }
  
}
