import pool from "./paymentDb";

const initializePayoutDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id SERIAL PRIMARY KEY,
        payment_id VARCHAR(255) NOT NULL,
        account_type VARCHAR(10) NOT NULL,  -- 'admin' or 'instructor'
        account_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- Payout status: 'pending', 'completed', 'failed'
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_payment
          FOREIGN KEY(payment_id)
          REFERENCES payments(id)
          ON DELETE CASCADE
      );

      -- Create an index for payment_id to optimize queries
      CREATE INDEX IF NOT EXISTS idx_payouts_payment_id ON payouts(payment_id);

      -- Create an index for account_type to optimize queries
      CREATE INDEX IF NOT EXISTS idx_payouts_account_type ON payouts(account_type);
    `);
    console.log('Payouts table has been initialized.');
  } catch (error) {
    console.error('Error initializing payout database:', error);
  } finally {
    client.release();
  }
};

export default initializePayoutDatabase;
