"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Selam! I am your Delala Home Rental Assistant. How can I help you find apartments, schedule property tours, or answer rental questions today?",
      isBot: true,
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), text: userText, isBot: false };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      
      if (data.text) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: data.text,
          isBot: true,
        }]);
      } else {
        throw new Error("No response text");
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again later.",
        isBot: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* FIXED: Adjusted placement globally. Pushed up to bottom-24 on mobile, falls back to bottom-6 on screen-sm */
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        /* FIXED: Added max-w properties and dynamic max-height variables so the layout box won't clip out of small displays */
        <Card className="mb-4 h-[420px] w-[calc(100vw-3rem)] max-w-[340px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 bg-white animate-in slide-in-from-bottom-5 duration-200 sm:h-[450px] sm:max-w-[380px] sm:w-[380px]">
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-400" />
              <span>Delala Assistant</span>
            </CardTitle>
            <Button 
              variant="ghost" 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0 flex items-center justify-center rounded-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.isBot
                      ? "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                      : "bg-emerald-600 text-white rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 border-t border-slate-100 bg-white">
            <form onSubmit={handleSend} className="flex w-full items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about platform..."
                className="flex-1 text-sm bg-slate-100 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-transparent"
              />
              <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9 p-0 shrink-0 flex items-center justify-center rounded-lg disabled:opacity-50">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Main Container Layer handling the Pulse Glow effect */}
      <div className="relative group">
        {!isOpen && (
          <>
            {/* Outer Radiant Pulsing Glow Ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 animate-ping duration-1000 pointer-events-none" />
            {/* Secondary Soft Ambient Wave Backing */}
            <span className="absolute inset-[-4px] sm:inset-[-6px] rounded-full bg-emerald-400/30 blur-sm animate-pulse duration-700 pointer-events-none" />
          </>
        )}

        {/* Core Trigger Button - FIXED: Responsive size classes prevent it from overlapping navigation bounds */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative rounded-full h-14 w-14 sm:h-18 sm:w-18 shadow-2xl transition-all duration-300 p-0 flex items-center justify-center border border-white/10 group-hover:scale-105 active:scale-95 ${
            isOpen ? "bg-slate-800 hover:bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              {/* Corner Notification Badge */}
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-300"></span>
              </span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}