import mongoose, { Schema, Document } from 'mongoose';

export interface PaymentDocument extends Document {
  id: string;
  sessionId: string;
  stripePaymentIntentId: string;
  userId: string;
  instructorId: string;
  courseId: string;
  amountInINR: number;
  amountInUSD: number;
  adminAmount: number;
  instructorAmount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  adminAccountId: string;
  instructorAccountId: string;
  adminPayoutStatus: 'pending' | 'completed' | 'failed';
  instructorPayoutStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true }, 
  sessionId: { type: String, required: false }, 
  stripePaymentIntentId: { type: String, required: false },
  userId: { type: String, required: true }, 
  instructorId: { type: String, required: true }, 
  courseId: { type: String, required: true }, 
  amountInINR: { type: Number, required: true },
  amountInUSD: { type: Number, required: true }, 
  adminAmount: { type: Number, required: true },
  instructorAmount: { type: Number, required: true }, 
  currency: { type: String, required: true }, 
  status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  adminAccountId: { type: String, required: true },
  instructorAccountId: { type: String, required: true },
  adminPayoutStatus: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  instructorPayoutStatus: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  createdAt: { type: Date, required: true, default: Date.now }, 
  updatedAt: { type: Date, required: true, default: Date.now }, 
});


PaymentSchema.index({ userId: 1 });

const PaymentModel = mongoose.model<PaymentDocument>('Payment', PaymentSchema);

export default PaymentModel;
