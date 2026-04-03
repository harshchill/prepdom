"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { easeInOut, easeOut, motion } from "framer-motion";
import { SquareArrowOutUpLeft } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", text: messageToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const res = await fetch("/api/auth/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, history }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "model", text: data.reply || "Error: " + data.error },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "model", text: "Network error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen  overflow-hidden bg-[#eef4ec] relative">
      {/* Hamburger Button - only shows when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 cursor-pointer left-4 z-50 flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#d1e8d4] transition"
        >
          <span className="w-8 h-1 bg-[#1b4332] block"></span>
          <span className="w-8 h-1 bg-[#1b4332] block"></span>
          <span className="w-8 h-1 bg-[#1b4332] block"></span>
        </button>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-60 flex flex-col bg-[#2d6a4f] rounded-r-[10px] py-5 flex-shrink-0">
          {/* Logo */}
          <div className="px-5 mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1b4332] flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
              <span className="font-semibold text-white text-[20px]">
                Vault
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              onClick={() => setSidebarOpen(false)}
              className="text-2xl cursor-pointer font-bold text-white hover:opacity-60 transition"
            >
              ✕
            </motion.button>
          </div>

          {/* New Chat */}
          <div className="px-4 mb-5">
            <button
              onClick={() => setMessages([])}
              className="w-full cursor-pointer font-semibold py-2 px-3 rounded-lg bg-[#1b4332] text-white flex items-center gap-2 hover:bg-[#14532d] transition"
            >
              <span>＋</span> New Chat
            </button>
          </div>

          {/* Nav */}
          <nav className="px-3 flex flex-col gap-1 flex-1">
            <p className=" px-2 mb-2 uppercase tracking-widest font-bold text-white">
              Menu
            </p>
            <Link
              href="/user/browse"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] hover:bg-[#1b4332] text-white hover:opacity-80 transition"
            >
              Browse Previous Papers
            </Link>

            <Link
              href="/user/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[16px] text-white hover:bg-[#1b4332] transition"
            >
              <SquareArrowOutUpLeft size={16} />
              Dasboard
            </Link>
          </nav>

          {/* Bottom */}
          <div className="px-3 mt-auto flex flex-col gap-1">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[20px] text-white hover:bg-[#1b4332] transition w-full text-left">
              ⚙️ Settings and help
            </button>
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#d1e8d4] flex items-center justify-center mb-5">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-6xl font-semibold mb-2 text-[#1b4332]">
                Hey, Student!
              </h2>
              <p className="text-[16px] mb-8 mt-3  text-[#52796f]">
                Ask me anything about your uploaded exam papers. I will explain
                topics, summarize sections, and help you prepare.
              </p>
            </div>
          )}

          {/* Chat Messages */}
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end  gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI Avatar */}
                {msg.role === "model" && (
                  <div className="w-10 h-10 rounded-full bg-[#2d6a4f] flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="text-white text-[16px] font-bold">AI</span>
                  </div>
                )}

                <div
                  className={`max-w-[100%] px-4 py-3 text-[20px] leading-relaxed whitespace-pre-wrap  break-words ${
                    msg.role === "user"
                      ? "bg-[#2d6a4f] text-white rounded-2xl rounded-br-sm"
                      : "bg-white text-[#1b4332] border border-[#c8ddc8] rounded-2xl  rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-[#74a88a] flex items-center justify-center flex-shrink-0 mb-1">
                    <span className="text-white text-[16px] font-bold">U</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#2d6a4f] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-white border border-[#c8ddc8] px-4 py-3 rounded-2xl">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 rounded-full bg-[#2d6a4f] animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-2 py-4 flex-shrink-0 bg-[#eef4ec] border-2 shadow-2xl rounded-4xl mb-15 w-[700px] self-center border-gray-300">
          <div className="max-w-2xl shadow-2xs mx-auto flex items-end gap-3 px-4 py-3 rounded-full bg-white border-2 border-[#c8ddc8]">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="How can I help you today?"
              className="flex-1 h-6.5 bg-transparent mx-auto block text-[16px] resize-none outline-none focus:outline-none text-[#1b4332] placeholder-[#94c4a8]"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-full bg-[#2d6a4f] flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#1b4332] transition"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
