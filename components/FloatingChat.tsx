"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import botAvatar from "@/public/aichatbot.png";

type Msg = {
  id: string;
  role: "user" | "bot";
  text: string;
  pointsDeducted?: number;
  isHintRequest?: boolean;
  ts?: number;
};

interface FloatingChatProps {
  userId?: string;
  challengeId?: string;
  onPointsDeducted?: (points: number, total: number) => void;
}

export default function FloatingChat({
  userId,
  challengeId,
  onPointsDeducted,
}: FloatingChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [totalPointsDeducted, setTotalPointsDeducted] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat stats on mount
  useEffect(() => {
    if (challengeId && userId) {
      fetchChatStats();
    }
  }, [challengeId, userId]);

  const fetchChatStats = async () => {
    try {
      const res = await fetch(`/api/chat/stats?challengeId=${challengeId}`);
      if (res.ok) {
        const data = await res.json();
        setTotalPointsDeducted(data.totalPointsDeducted || 0);
        setTotalHintsUsed(data.totalHintsUsed || 0);
      }
    } catch (error) {
      console.error("Error fetching chat stats:", error);
    }
  };

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greetingMsg: Msg = {
        id: "greeting",
        role: "bot",
        ts: Date.now(),
        text: "Hi! I'm Hintsye 🐣 — your friendly challenge buddy. Ask me anything and I'll help you beat it, one step at a time!\n\n⚠️ Note: Asking for hints will deduct points from your score. Use wisely!",
      };
      setMessages([greetingMsg]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(msg: string) {
    // Guard against Enter while a reply is pending (would double-charge hints)
    if (!msg.trim() || loading) return;

    const newUserMsg: Msg = {
      id: Date.now().toString(),
      role: "user",
      text: msg,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          userId,
          challengeId,
          hintLevel: "nudge",
        }),
      });

      const data = await res.json();

      // Update stats if points were deducted
      if (data.pointsDeducted > 0) {
        const newTotal = data.totalPointsDeducted || 0;
        const newHintsUsed = data.totalChatHintsUsed || 0;
        
        setTotalPointsDeducted(newTotal);
        setTotalHintsUsed(newHintsUsed);

        // Notify parent component
        if (onPointsDeducted) {
          onPointsDeducted(data.pointsDeducted, newTotal);
        }
      }

      const newBotMsg: Msg = {
        id: `${Date.now()}-bot`,
        role: "bot",
        text: data.reply,
        ts: Date.now(),
        pointsDeducted: data.pointsDeducted || 0,
        isHintRequest: data.isHintRequest || false,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "bot",
          ts: Date.now(),
          text: "I apologize, but I'm unable to process your request at the moment. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open hint chat"
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {totalHintsUsed > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
              {totalHintsUsed}
            </span>
          )}
          {totalPointsDeducted > 0 && (
            <span className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
              -{totalPointsDeducted}
            </span>
          )}
        </button>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-96 h-[min(600px,calc(100dvh-2.5rem))] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={botAvatar}
                  alt="Assistant"
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-white shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-base">Hintsye</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close hint chat"
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Stats Bar */}
          {totalHintsUsed > 0 && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-xs flex-shrink-0">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  {totalHintsUsed} chat hint{totalHintsUsed !== 1 ? "s" : ""} used
                </span>
              </div>
              <span className="font-semibold text-red-600">
                -{totalPointsDeducted} pts
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "bot" && (
                  <div className="flex-shrink-0">
                    <Image
                      src={botAvatar}
                      alt="Assistant"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] ${
                    m.role === "user" ? "order-1" : "order-2"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg shadow-sm ${
                      m.role === "user"
                        ? "bg-red-600 text-white rounded-br-none"
                        : m.isHintRequest
                        ? "bg-yellow-50 text-gray-800 rounded-bl-none border border-yellow-300"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </p>
                    {(m.pointsDeducted ?? 0) > 0 && (
                      <div className="mt-2 pt-2 border-t border-yellow-300 flex items-center gap-1 text-xs font-semibold text-red-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        -{m.pointsDeducted} points
                      </div>
                    )}
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-1 px-1 ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(m.ts ?? 0).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {m.role === "user" && session?.user?.image && (
                  <div className="flex-shrink-0 order-2">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <Image
                    src={botAvatar}
                    alt="Assistant"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </div>
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-gray-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-100 px-4 py-3 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all placeholder-gray-500 text-sm"
                placeholder="Type your message..."
                aria-label="Message"
                maxLength={2000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                aria-label="Send message"
                disabled={loading || !input.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-5 py-3 rounded-lg text-white font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}