import mongoose, { model } from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: false },
  senderProfile:{type:String,required:false},
  conversationId:{type:String,required:true},
  recipientEmail:{type:String,required:false},
  replyTo: {
    messageId: { type: mongoose.Schema.Types.ObjectId, default: null },
    text: { type: String }, // embedding text of the replied message
    senderId: { type: mongoose.Schema.Types.ObjectId,}, // sender of the original message
  },  
  text: { type: String, required: false },
  fileUrl: { type: String },
  fileType: { type: String },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  isGroup:{type:Boolean,required:false,default:false},
  groupId:{type:String,required:false},
  readBy: [{ type: mongoose.Schema.Types.ObjectId,required:false }],  // Array to store users who have read this message
  createdAt: { type: Date, required: true, default: Date.now },
});

export const MessageModel = model('messages', messageSchema);
