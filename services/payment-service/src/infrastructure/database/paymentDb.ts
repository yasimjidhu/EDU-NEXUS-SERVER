
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectDB = async () => {
  const MONGO_URI = process.env.AZURE_DB_URI || 'mongodb://localhost:27017/PaymentsDB';

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'Payments', 
    });
    console.log('Connected to MongoDB Payments database',MONGO_URI);
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;

