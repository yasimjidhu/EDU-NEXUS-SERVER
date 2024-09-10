import pool from "./paymentDb";

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        instructor_id VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        amount_in_inr INTEGER NOT NULL,
        amount_in_usd INTEGER NOT NULL,
        admin_amount INTEGER NOT NULL,
        instructor_amount INTEGER NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(20) NOT NULL,
        admin_account_id VARCHAR(255) NOT NULL,
        instructor_account_id VARCHAR(255) NOT NULL,
        admin_payout_status VARCHAR(20) NOT NULL,
        instructor_payout_status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create an index for user_id to optimize queries
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};

export default initializeDatabase;
