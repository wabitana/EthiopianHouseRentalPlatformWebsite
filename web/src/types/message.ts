export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
