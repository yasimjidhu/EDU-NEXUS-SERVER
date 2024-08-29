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
           amount INTEGER NOT NULL,
           currency VARCHAR(3) NOT NULL,
           status VARCHAR(20) NOT NULL,
           created_at TIMESTAMP NOT NULL,
           updated_at TIMESTAMP NOT NULL
         );
         
         CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
       `);
       console.log('Database initialized successfully');
     } catch (error) {
       console.error('Error initializing database:', error);
     } finally {
       client.release();
     }
   };

   export default initializeDatabase;
   