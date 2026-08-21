"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Search, Trash2, X, AlertCircle, RefreshCw } from "lucide-react";
import { mockConversations, MessageConversation } from "@/lib/portal-mock-data";
import { apiFetch } from "@/lib/api";

const mapBackendInquiryToConv = (inq: any): MessageConversation => {
  const msgs = (inq.messages || []).map((m: any) => ({
    id: m.id || `msg_${Date.now()}_${Math.random()}`,
    sender: (m.senderRole === "admin" || m.senderRole === "agent" || m.senderId === "admin_user") ? "me" : "other",
    text: m.text || m.message || "",
    timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
  }));

  return {
    id: inq.id,
    participantName: inq.seekerName || "House Seeker",
    participantRole: "Seeker",
    participantAvatar: inq.propertyImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    lastMessage: inq.message || (msgs[msgs.length - 1]?.text) || "No messages",
    lastMessageTime: inq.updatedAt ? new Date(inq.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
    unreadCount: 0,
    online: true,
    messages: msgs.length > 0 ? msgs : [
      {
        id: `msg_init_${inq.id}`,
        sender: "other",
        text: inq.message || "Selam! I submitted an inquiry for this property listing.",
        timestamp: "Recently",
      }
    ],
  };
};

export default function AgentMessagesPage() {
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDatabaseInquiries() {
    try {
      setLoading(true);
      const data = await apiFetch("/inquiries");
      if (Array.isArray(data)) {
        const mapped = data.map(mapBackendInquiryToConv);
        setConversations(mapped);
        if (mapped.length > 0) setActiveId(mapped[0].id);
        else setActiveId("");
      } else {
        setConversations([]);
        setActiveId("");
      }
    } catch (err) {
      console.error("Failed to fetch database inquiries:", err);
      setConversations([]);
      setActiveId("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatabaseInquiries();
  }, []);

  const activeConv = conversations.find((c) => c.id === activeId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const messageText = inputText.trim();
    setInputText("");

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "me" as const,
      text: messageText,
      timestamp: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: messageText,
              lastMessageTime: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    try {
      await apiFetch(`/inquiries/${activeId}/messages`, {
        method: "POST",
        body: { message: messageText },
      });
    } catch (err) {
      console.error("Failed to persist message to PostgreSQL database:", err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updatedMsgs = c.messages.filter((m) => m.id !== msgId);
          const lastMsgObj = updatedMsgs[updatedMsgs.length - 1];
          return {
            ...c,
            messages: updatedMsgs,
            lastMessage: lastMsgObj ? lastMsgObj.text : "No messages",
          };
        }
        return c;
      })
    );

    try {
      await apiFetch(`/inquiries/${activeId}/messages/${msgId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete message from PostgreSQL:", err);
    }
  };

  const handleClearChat = async () => {
    if (!activeConv) return;
    if (!confirm(`Permanently clear all messages with ${activeConv.participantName} from database?`)) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [],
              lastMessage: "Conversation cleared",
            }
          : c
      )
    );

    try {
      await apiFetch(`/inquiries/${activeId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear chat from database:", err);
    }
  };

  const handleDeleteConversation = async (convId: string, name: string) => {
    if (!confirm(`Permanently delete conversation with ${name} from database?`)) return;
    const remaining = conversations.filter((c) => c.id !== convId);
    setConversations(remaining);
    if (activeId === convId && remaining.length > 0) {
      setActiveId(remaining[0].id);
    }

    try {
      await apiFetch(`/inquiries/${convId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete conversation from database:", err);
    }
  };

  const handleClearAllConversations = async () => {
    if (!confirm("Are you sure you want to PERMANENTLY delete ALL conversations from database?")) return;
    setConversations([]);

    try {
      await apiFetch("/inquiries/clear-all", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear all inquiries from database:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-80 border-r border-slate-700/80 flex flex-col bg-slate-850">
        <div className="p-4 border-b border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" /> Agent Messages
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={loadDatabaseInquiries}
                title="Refresh Database Messages"
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              {conversations.length > 0 && (
                <button
                  onClick={handleClearAllConversations}
                  title="Clear All Conversations Permanently"
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded-lg"
                >
                  <Trash2 className="h-3 w-3" /> Clear All
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No messages stored in database
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full text-left p-3.5 transition-colors flex items-start justify-between cursor-pointer group ${
                  activeId === conv.id ? "bg-slate-700/80" : "hover:bg-slate-750"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full ring-2 ring-slate-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-xs truncate">{conv.participantName}</p>
                      <span className="text-[10px] text-slate-400">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[10px] text-blue-400 font-semibold">{conv.participantRole}</p>
                    <p className="text-xs text-slate-300 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id, conv.participantName);
                  }}
                  title="Delete Conversation Permanently"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity ml-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Chat Thread */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-slate-900">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeConv.participantAvatar}
                alt={activeConv.participantName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <div>
                <h3 className="font-bold text-white text-sm">{activeConv.participantName}</h3>
                <span className="text-xs text-blue-400 font-medium">
                  {activeConv.participantRole} • {activeConv.online ? "Online Now" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                title="Clear all messages in this conversation permanently"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Chat
              </button>
              <button
                onClick={() => handleDeleteConversation(activeConv.id, activeConv.participantName)}
                title="Delete this entire conversation permanently"
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Delete Conv
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeConv.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-600" />
                <p>No messages in this conversation.</p>
              </div>
            ) : (
              activeConv.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col group ${m.sender === "me" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 max-w-md">
                    {m.sender === "me" && (
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        title="Delete message permanently"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                        m.sender === "me"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                      }`}
                    >
                      <p>{m.text}</p>
                      <span
                        className={`text-[9px] block text-right font-medium ${
                          m.sender === "me" ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                    {m.sender !== "me" && (
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        title="Delete message permanently"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-850 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type a message to ${activeConv.participantName}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-900">
          <MessageSquare className="h-10 w-10 text-slate-600 mb-2" />
          <p>No active conversation selected.</p>
        </div>
      )}
    </div>
  );
}
