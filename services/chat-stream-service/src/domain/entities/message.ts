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
}
