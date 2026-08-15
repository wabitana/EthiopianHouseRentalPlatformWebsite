"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationHistory = getConversationHistory;
exports.saveConversationHistory = saveConversationHistory;
exports.clearConversationHistory = clearConversationHistory;
const memoryStore = new Map();
const MAX_CONVERSATION_MESSAGES = 12;
function getConversationHistory(conversationId) {
    return memoryStore.get(conversationId) || [];
}
function saveConversationHistory(conversationId, history) {
    if (history.length > MAX_CONVERSATION_MESSAGES) {
        const trimmed = history.slice(-MAX_CONVERSATION_MESSAGES);
        memoryStore.set(conversationId, trimmed);
    }
    else {
        memoryStore.set(conversationId, history);
    }
}
function clearConversationHistory(conversationId) {
    memoryStore.delete(conversationId);
}
