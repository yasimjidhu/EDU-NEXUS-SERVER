export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string;
  text: string;
  audio?:string;
  status: string,
  createdAt: Date;
}
