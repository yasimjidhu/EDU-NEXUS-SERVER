import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentEntity } from '../../domain/entities/payment';
import { v4 as uuidv4 } from 'uuid';
import { startOfDay, endOfDay } from 'date-fns';
import PaymentModel from '../database/model/payment';
export class PaymentRepositoryImpl implements PaymentRepository {
  
  async create(payment: PaymentEntity): Promise<void> {
    try {
      // If payment.id is empty, generate a new one
      if (!payment.id || payment.id.trim() === '') {
        payment.id = uuidv4(); // Generate a unique ID
      }

      // Check if the payment already exists
      const existingPayment = await PaymentModel.findOne({ id: payment.id });
      if (existingPayment) {
        // Payment already exists, don't insert again
        return;
      }

      // Create new payment
      const newPayment = new PaymentModel({
        ...payment,
        adminAccountId: payment.adminAccountId || null,
        instructorAccountId: payment.instructorAccountId || null,
        adminPayoutStatus: payment.adminPayoutStatus || 'pending',
        instructorPayoutStatus: payment.instructorPayoutStatus || 'pending',
      });

      // Save payment
      const savedPayment = await newPayment.save();
      console.log('Saved payment:', savedPayment);
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async updateStatus(payment_intent_id: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    try {
      await PaymentModel.updateOne(
        { stripePaymentIntentId: payment_intent_id },
        { $set: { status, updatedAt: new Date() } }
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  async updateTransferStatus(
    id: string,
    type: 'admin' | 'instructor',
    status: 'pending' | 'completed' | 'failed'
  ): Promise<void> {
    const updateField = type === 'admin' ? 'adminPayoutStatus' : 'instructorPayoutStatus';
    
    try {
      await PaymentModel.updateOne(
        { id },
        { $set: { [updateField]: status, updatedAt: new Date() } }
      );
      console.log(`${type} transfer status updated to ${status} for payment ID ${id}`);
    } catch (error) {
      console.error(`Error updating ${type} transfer status for payment ID ${id}:`, error);
      throw new Error('Failed to update transfer status');
    }
  }

  async findBySessionId(sessionId: string): Promise<PaymentEntity | null> {
    const payment = await PaymentModel.findOne({ sessionId });
    if (!payment) return null;

    return new PaymentEntity(
      payment.id,
      payment.sessionId,
      payment.stripePaymentIntentId,
      payment.userId,
      payment.instructorId,
      payment.courseId,
      payment.amountInINR,
      payment.amountInUSD,
      payment.adminAmount,
      payment.instructorAmount,
      payment.currency,
      payment.status,
      payment.createdAt,
      payment.updatedAt,
      payment.adminAccountId,
      payment.instructorAccountId,
      payment.adminPayoutStatus,
      payment.instructorPayoutStatus
    );
  }

  async findPaymentIntentId(userId: string, courseId: string): Promise<PaymentEntity | null> {
    const payment = await PaymentModel.findOne({ userId, courseId });
    if (!payment) return null;

    return new PaymentEntity(
      payment.id,
      payment.sessionId,
      payment.stripePaymentIntentId,
      payment.userId,
      payment.instructorId,
      payment.courseId,
      payment.amountInINR,
      payment.amountInUSD,
      payment.adminAmount,
      payment.instructorAmount,
      payment.currency,
      payment.status,
      payment.createdAt,
      payment.updatedAt,
      payment.adminAccountId,
      payment.instructorAccountId,
      payment.adminPayoutStatus,
      payment.instructorPayoutStatus
    );
  }

  async findTransactions(filter: { sortBy?: string; sortOrder?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<{ transactions: PaymentEntity[], totalPages: number }> {
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    try {
      const transactions = await PaymentModel.find()
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalRecords = await PaymentModel.countDocuments().exec();
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        transactions: transactions.map(payment => new PaymentEntity(
          payment.id,
          payment.sessionId,
          payment.stripePaymentIntentId,
          payment.userId,
          payment.instructorId,
          payment.courseId,
          payment.amountInINR,
          payment.amountInUSD,
          payment.adminAmount,
          payment.instructorAmount,
          payment.currency,
          payment.status,
          payment.createdAt,
          payment.updatedAt,
          payment.adminAccountId,
          payment.instructorAccountId,
          payment.adminPayoutStatus,
          payment.instructorPayoutStatus
        )),
        totalPages,
      };
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async findByInstructorId(instructorId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    try {
      const payments = await PaymentModel.find({ instructorId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      return payments.map(payment => new PaymentEntity(
        payment.id,
        payment.sessionId,
        payment.stripePaymentIntentId,
        payment.userId,
        payment.instructorId,
        payment.courseId,
        payment.amountInINR,
        payment.amountInUSD,
        payment.adminAmount,
        payment.instructorAmount,
        payment.currency,
        payment.status,
        payment.createdAt,
        payment.updatedAt,
        payment.adminAccountId,
        payment.instructorAccountId,
        payment.adminPayoutStatus,
        payment.instructorPayoutStatus
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async findByStudentId(studentId: string, limit: number, offset: number): Promise<PaymentEntity[]> {
    try {
      const payments = await PaymentModel.find({ userId: studentId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      return payments.map(payment => new PaymentEntity(
        payment.id,
        payment.sessionId,
        payment.stripePaymentIntentId,
        payment.userId,
        payment.instructorId,
        payment.courseId,
        payment.amountInINR,
        payment.amountInUSD,
        payment.adminAmount,
        payment.instructorAmount,
        payment.currency,
        payment.status,
        payment.createdAt,
        payment.updatedAt,
        payment.adminAccountId,
        payment.instructorAccountId,
        payment.adminPayoutStatus,
        payment.instructorPayoutStatus
      ));
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }

  async getTotalTransactionsForInstructor(instructorId: string): Promise<number> {
    try {
      const totalTransactions = await PaymentModel.countDocuments({ instructorId }).exec();
      return totalTransactions;
    } catch (error) {
      console.error('Error retrieving total transactions:', error);
      throw new Error('Failed to retrieve total transactions');
    }
  }

  async getTotalTransactionsForStudent(studentId: string): Promise<number> {
    try {
      const totalTransactions = await PaymentModel.countDocuments({ userId: studentId }).exec();
      return totalTransactions;
    } catch (error) {
      console.error('Error retrieving total transactions:', error);
      throw new Error('Failed to retrieve total transactions');
    }
  }

  async getTodayRevenueForInstructor(instructorId: string): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    try {
      const result = await PaymentModel.aggregate([
        { $match: { instructorId, createdAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, totalRevenue: { $sum: "$instructorAmount" } } }
      ]);

      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error('Error retrieving today\'s revenue:', error);
      throw new Error('Failed to retrieve today\'s revenue');
    }
  }
  async getTodayRevenueForAdmin(): Promise<number> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    try {
      const result = await PaymentModel.aggregate([
        { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, totalRevenue: { $sum: "$adminAmount" } } }
      ]);

      return result.length > 0 ? result[0].totalRevenue : 0;
    } catch (error) {
      console.error('Error retrieving today\'s revenue for admin:', error);
      throw new Error('Failed to retrieve today\'s revenue for admin');
    }
  }

  async getTotalEarningsForInstructor(instructorId: string): Promise<number> {
    try {
      const result = await PaymentModel.aggregate([
        { $match: { instructorId } },
        { $group: { _id: null, totalEarnings: { $sum: "$instructorAmount" } } }
      ]);

      return result.length > 0 ? result[0].totalEarnings : 0;
    } catch (error) {
      console.error('Error retrieving total earnings for instructor:', error);
      throw new Error('Failed to retrieve total earnings for instructor');
    }
  }

  async getTotalEarningsForAdmin(): Promise<number> {
    try {
      const result = await PaymentModel.aggregate([
        { $group: { _id: null, totalEarnings: { $sum: "$adminAmount" } } }
      ]);

      return result.length > 0 ? result[0].totalEarnings : 0;
    } catch (error) {
      console.error('Error retrieving total earnings for admin:', error);
      throw new Error('Failed to retrieve total earnings for admin');
    }
  }

}
