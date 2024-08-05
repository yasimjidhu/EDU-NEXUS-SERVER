export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string;
  text: string;
  status: string,
  createdAt: Date;
  _id?:string;
}
