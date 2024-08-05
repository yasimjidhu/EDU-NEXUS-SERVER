CREATE TABLE payments (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
  );
  
  CREATE INDEX idx_payments_user_id ON payments(user_id);