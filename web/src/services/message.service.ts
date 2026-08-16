import { apiClient } from './api';
import { ApiResponse } from '../types/api';

export const messageService = {
  async sendMessage(data: { receiverId: string; content: string; propertyId?: string }): Promise<ApiResponse> {
    return apiClient.post('/messaging', data);
  },

  async getConversations(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/messaging/conversations');
  },

  async getThread(otherUserId: string, propertyId?: string): Promise<ApiResponse<any[]>> {
    const url = propertyId ? `/messaging/thread/${otherUserId}?propertyId=${propertyId}` : `/messaging/thread/${otherUserId}`;
    return apiClient.get(url);
  },
};
