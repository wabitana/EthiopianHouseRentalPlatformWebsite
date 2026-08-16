import { apiClient } from './api';

export const messageService = {
  getConversations: () => apiClient.get('/messages/conversations', true),
  getMessages: (conversationId: string) =>
    apiClient.get('/messages/conversations/' + conversationId, true),
  sendMessage: (data: { recipientId: string; propertyId?: string; content: string }) =>
    apiClient.post('/messages', data, true),
};
