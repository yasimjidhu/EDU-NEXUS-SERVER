import mongoose, { model } from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  conversationId:{type:String,required:true},
  text: { type: String, required: false },
  fileUrl: { type: String },
  fileType: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  createdAt: { type: Date, required: true, default: Date.now },
});

export const MessageModel = model('messages', messageSchema);
