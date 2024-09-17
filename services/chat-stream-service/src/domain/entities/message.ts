export interface Message {
  id?: string;
  conversationId: string;
  recipientEmail?:string;
  senderId: string;
  senderName?:string;
  senderProfile?:string;
  text?: string;
  fileUrl?: string;
  fileType?: 'audio' | 'image' | 'video';
  status: string;
  createdAt?: Date;
  updatedAt?:Date;
  _id?: string;
  isGroup?:boolean;
  groupId?:string;
  replyTo?: {
    messageId?: string;  // ID of the message being replied to
    text?: string;      // Text of the original message (optional if it's a file)
    senderId?: string;   // ID of the sender of the original message
  };
}
