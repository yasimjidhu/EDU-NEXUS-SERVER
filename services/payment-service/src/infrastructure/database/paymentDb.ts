import dotenv from 'dotenv'
import { Pool, PoolConfig } from 'pg';
dotenv.config()

const dbConfig: PoolConfig = {
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DB, 
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
};

const pool = new Pool(dbConfig);

export const StartPaymentDb = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error:any) {
    console.error('Error connecting to PostgreSQL database:', error);
  }
};

export default pool;
