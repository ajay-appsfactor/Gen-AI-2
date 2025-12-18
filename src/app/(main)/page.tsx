"use client";
import axios from "axios";
import ChatInput from "@/components/chatinput/chatinput";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github.css';
import { nanoid } from "nanoid";

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setAllMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const hasFetched = useRef(false); // Strict Mode guard
  const [autoScroll, setAutoScroll] = useState(true);

  const sendPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage = {
      id: nanoid(),
      role: "user",
      content: prompt,
    };

    const loadingMessage = {
      id: "loading",
      role: "assistant",
      content: "",
      loading: true,
    };

    // 1️⃣ Show user message + searching loader immediately
    setAllMessages(prev => [...prev, userMessage, loadingMessage]);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { prompt });

      // 2️⃣ Replace loader with real response
      setAllMessages(prev =>
        prev.map(msg =>
          msg.id === "loading"
            ? {
              id: nanoid(),
              role: "assistant",
              content: res.data.response,
            }
            : msg
        )
      );
    } catch (err) {
      console.error(err);

      setAllMessages(prev =>
        prev.map(msg =>
          msg.id === "loading"
            ? {
              id: nanoid(),
              role: "assistant",
              content: "⚠️ Something went wrong",
            }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // const sendPrompt = async (prompt: string) => {
  //   const tempUser = { id: Date.now(), role: "user", content: prompt };
  //   setAllMessages(prev => [...prev, tempUser]);
  //   await streamAssistantResponse(prompt);
  // };


  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

    // If user is close to bottom (within 50px), enable auto-scroll
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setAutoScroll(true);
    } else {
      // User scrolled up -> stop auto-scroll
      setAutoScroll(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
    }
  }, []);

  function SearchingLoader() {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <span className="animate-pulse">Searching…</span>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col overflow-scroll" ref={chatContainerRef} onScroll={handleScroll}>
      <div className="flex-1 flex flex-col gap-2 m-auto w-3xl pb-[10rem]" >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`w-3xl py-2 px-3 rounded-xl ${msg.role === "user"
              ? "max-w-xl self-end bg-neutral-100"
              : "self-start"
              }`}
          >
            {msg.loading ? (
              <SearchingLoader />
            ) : (
              <ReactMarkdown
                children={msg.content}
                rehypePlugins={[rehypeHighlight as any]}
                className="prose break-words"
              />
            )}
          </div>
        ))}

      </div>
      <div className="sticky bottom-0 flex gap-2 w-full z-1 flex-col items-center bg-white">

        <div className="w-3xl">
          <ChatInput sendPrompt={sendPrompt} />
        </div>
        <p className="bg-white mb-2 text-xs text-neutral-600">Appsfactor can make mistakes. Check important info. See Cookie Preferences.</p>
      </div>
    </div>
  );
}
