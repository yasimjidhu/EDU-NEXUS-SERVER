
  CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    instructor_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    amount_in_inr INTEGER NOT NULL, -- Total amount in INR (cents)
    amount_in_usd INTEGER NOT NULL, -- Total amount in USD (cents)
    amount INTEGER NOT NULL,
    admin_amount INTEGER NOT NULL,
    instructor_amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    admin_account_id VARCHAR(255) NOT NULL, -- Stripe account ID for the admin (where admin amount goes)
    instructor_account_id VARCHAR(255) NOT NULL, -- Stripe account ID for the instructor (where instructor amount goes)
    admin_payout_status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed'
    instructor_payout_status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
  );
  
  
  CREATE INDEX idx_payments_user_id ON payments(user_id);