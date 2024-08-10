export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  fileUrl?: string;
  fileType?: 'audio' | 'image' | 'video';
  status: string;
  createdAt: Date;
  _id?: string;
}
