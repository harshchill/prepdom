"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SquareArrowOutUpLeft } from "lucide-react";

export default function AiTutorClient() {
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

    if (!messageToSend.trim() || loading) {
      return;
    }

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
        { role: "model", text: data.reply || `Error: ${data.error}` },
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
    <div className="relative flex h-screen overflow-hidden bg-[#eef4ec]">
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-4 top-4 z-50 flex cursor-pointer flex-col gap-1.5 rounded-lg p-2 transition hover:bg-[#d1e8d4]"
        >
          <span className="block h-1 w-8 bg-[#1b4332]"></span>
          <span className="block h-1 w-8 bg-[#1b4332]"></span>
          <span className="block h-1 w-8 bg-[#1b4332]"></span>
        </button>
      )}

      {sidebarOpen && (
        <div className="flex w-60 flex-shrink-0 flex-col rounded-r-[10px] bg-[#2d6a4f] py-5">
          <div className="mb-7 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1b4332]">
                <span className="text-xs font-bold text-white">V</span>
              </div>
              <span className="text-[20px] font-semibold text-white">Vault</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              onClick={() => setSidebarOpen(false)}
              className="cursor-pointer text-2xl font-bold text-white transition hover:opacity-60"
            >
              ✕
            </motion.button>
          </div>

          <div className="mb-5 px-4">
            <button
              onClick={() => setMessages([])}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-[#1b4332] px-3 py-2 font-semibold text-white transition hover:bg-[#14532d]"
            >
              <span>＋</span> New Chat
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3">
            <p className="mb-2 px-2 font-bold uppercase tracking-widest text-white">Menu</p>
            <Link
              href="/#library"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[16px] text-white transition hover:bg-[#1b4332] hover:opacity-80"
            >
              Browse Previous Papers
            </Link>

            <Link
              href="/user/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[16px] text-white transition hover:bg-[#1b4332]"
            >
              <SquareArrowOutUpLeft size={16} />
              Dashboard
            </Link>
          </nav>

          <div className="mt-auto flex flex-col gap-1 px-3">
            <button className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[20px] text-white transition hover:bg-[#1b4332]">
              ⚙️ Settings and help
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d1e8d4]">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="mb-2 text-6xl font-semibold text-[#1b4332]">Hey, Student!</h2>
              <p className="mb-8 mt-3 text-[16px] text-[#52796f]">
                Ask me anything about your uploaded exam papers. I will explain topics, summarize
                sections, and help you prepare.
              </p>
            </div>
          )}

          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f]">
                    <span className="text-[16px] font-bold text-white">AI</span>
                  </div>
                )}

                <div
                  className={`max-w-[100%] whitespace-pre-wrap break-words px-4 py-3 text-[20px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-sm bg-[#2d6a4f] text-white"
                      : "rounded-2xl rounded-bl-sm border border-[#c8ddc8] bg-white text-[#1b4332]"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === "user" && (
                  <div className="mb-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#74a88a]">
                    <span className="text-[16px] font-bold text-white">U</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end justify-start gap-2">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f]">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
                <div className="rounded-2xl border border-[#c8ddc8] bg-white px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2d6a4f] [animation-delay:0ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2d6a4f] [animation-delay:150ms]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2d6a4f] [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="mb-15 w-[700px] self-center rounded-4xl border-2 border-gray-300 bg-[#eef4ec] px-2 py-4 shadow-2xl">
          <div className="mx-auto flex max-w-2xl items-end gap-3 rounded-full border-2 border-[#c8ddc8] bg-white px-4 py-3 shadow-2xs">
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="How can I help you today?"
              className="mx-auto block h-6.5 flex-1 resize-none bg-transparent text-[16px] text-[#1b4332] outline-none placeholder-[#94c4a8] focus:outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2d6a4f] transition hover:bg-[#1b4332] disabled:opacity-40"
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
