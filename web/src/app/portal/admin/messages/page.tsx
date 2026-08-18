"use client";

import { useState } from "react";
import { MessageSquare, Send, Search, Phone, User, Check, ShieldCheck } from "lucide-react";
import { mockConversations, MessageConversation } from "@/lib/portal-mock-data";

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<MessageConversation[]>(mockConversations);
  const [activeId, setActiveId] = useState(mockConversations[0].id);
  const [inputText, setInputText] = useState("");

  const activeConv = conversations.find((c) => c.id === activeId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "me" as const,
      text: inputText,
      timestamp: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: inputText,
              lastMessageTime: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setInputText("");
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-140px)] flex flex-col md:flex-row">
      {/* Left Pane: Conversation List */}
      <div className="w-full md:w-80 border-r border-slate-700/80 flex flex-col bg-slate-850">
        <div className="p-4 border-b border-slate-700 space-y-3">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" /> Platform Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                activeId === conv.id ? "bg-slate-700/80" : "hover:bg-slate-750"
              }`}
            >
              <div className="relative">
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
                <p className="text-[10px] text-emerald-400 font-semibold">{conv.participantRole}</p>
                <p className="text-xs text-slate-300 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Chat Thread */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={activeConv.participantAvatar}
              alt={activeConv.participantName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <div>
              <h3 className="font-bold text-white text-sm">{activeConv.participantName}</h3>
              <span className="text-xs text-emerald-400 font-medium">
                {activeConv.participantRole} • {activeConv.online ? "Online Now" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeConv.messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "me" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                  m.sender === "me"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[9px] block text-right font-medium ${
                    m.sender === "me" ? "text-emerald-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-850 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type a message to ${activeConv.participantName}...`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
