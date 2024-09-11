CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  payment_id VARCHAR(255) NOT NULL, -- FK to payments table
  account_type VARCHAR(10) NOT NULL, -- 'admin' or 'instructor'
  account_id VARCHAR(255) NOT NULL, -- Stripe account id
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- Payout status ('pending', 'completed', 'failed')
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- Index to optimize queries on payment_id
CREATE INDEX idx_payouts_payment_id ON payouts(payment_id);
