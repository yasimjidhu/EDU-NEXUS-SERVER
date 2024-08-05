import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const connectDB = async () => {
  const MONGO_URI = process.env.CHAT_AND_STREAM_DB || 'mongodb://localhost:27017/Chat';

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'ChatAndStream',
    });
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;
