import dotenv from 'dotenv'
import { Pool, PoolConfig } from 'pg';
dotenv.config()

const dbConfig: PoolConfig = {
  user: process.env.POSTGRESS_DB_USER,
  host: 'localhost',
  database: process.env.PAYMENTS_DB_NAME, 
  password: process.env.PAYMENTS_DB_PASSWORD,
  port: process.env.POSTGRESS_DB_PORT ? parseInt(process.env.POSTGRESS_DB_PORT, 10) : 5432,
};

const pool = new Pool(dbConfig);

export const StartPaymentDb = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error:any) {
    console.error('Error connecting to PostgreSQL database:', error.message);
  }
};

export default pool;
