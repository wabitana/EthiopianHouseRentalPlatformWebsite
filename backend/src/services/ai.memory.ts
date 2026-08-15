export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

const memoryStore = new Map<string, ChatMessage[]>();

const MAX_CONVERSATION_MESSAGES = 12;

export function getConversationHistory(conversationId: string): ChatMessage[] {
  return memoryStore.get(conversationId) || [];
}

export function saveConversationHistory(conversationId: string, history: ChatMessage[]) {
  // Prune history if longer than MAX_CONVERSATION_MESSAGES
  if (history.length > MAX_CONVERSATION_MESSAGES) {
    // Keep first 2 (initial prompt/context) and last N messages
    const trimmed = history.slice(-MAX_CONVERSATION_MESSAGES);
    memoryStore.set(conversationId, trimmed);
  } else {
    memoryStore.set(conversationId, history);
  }
}

export function clearConversationHistory(conversationId: string) {
  memoryStore.delete(conversationId);
}
