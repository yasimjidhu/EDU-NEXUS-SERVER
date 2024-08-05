import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectDB = async () => {
  const MONGO_URI = process.env.COURCES_DB_URI || 'mongodb://localhost:27017/Users';

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'course-db' 
    });
    console.log('Course DB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;
