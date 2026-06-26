"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { SessionProvider } from "@/components/SessionProvider";
import { loadData, getGames, handleCommand, welcomeMessage, type Row } from "@/lib/lotto";

type Msg = {
  id: number;
  from: "user" | "bot";
  text: string;
  time: string;
};

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Bubble({ m }: { m: Msg }) {
  const isUser = m.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-3`}>
      <div
        className={`relative max-w-[78%] px-3 py-2 rounded-lg shadow-sm whitespace-pre-wrap break-words text-[14.5px] leading-snug ${
          isUser
            ? "bg-[#2a8a77] text-white rounded-tr-none"
            : "bg-[#1a1a1a] text-white rounded-tl-none"
        }`}
      >
        <MarkupText text={m.text} />
        <div className="text-[10px] text-gray-400/80 text-right mt-1 -mb-0.5">{m.time}</div>
      </div>
    </div>
  );
}

function MarkupText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^\*[^*]+\*$/.test(p))
          return (
            <strong key={i} className="font-semibold">
              {p.slice(1, -1)}
            </strong>
          );
        if (/^`[^`]+`$/.test(p))
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-black/30 text-[12.5px] font-mono">
              {p.slice(1, -1)}
            </code>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Typing() {
  return (
    <div className="flex justify-start px-3">
      <div className="bg-[#1a1a1a] rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400/70 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400/70 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400/70 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSendRef = useRef(0);
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pushBot = (text: string) =>
    setMessages((m) => [...m, { id: idRef.current++, from: "bot", text, time: nowTime() }]);
  const pushUser = (text: string) =>
    setMessages((m) => [...m, { id: idRef.current++, from: "user", text, time: nowTime() }]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadData();
        if (cancelled) return;
        setRows(data);
        const games = getGames(data);
        setTyping(true);
        setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          pushBot(welcomeMessage(games));
        }, 600);
      } catch {
        if (cancelled) return;
        setError("Couldn't load results. Check your connection.");
        pushBot("⚠️ Couldn't reach the server. Please try again later.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [typing]);

  const canSend = useMemo(() => !!rows && input.trim().length > 0, [rows, input]);

  const send = () => {
    const text = input.trim();
    if (!text || !rows) return;
    const now = Date.now();
    if (now - lastSendRef.current < 1000) return;
    lastSendRef.current = now;

    pushUser(text);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      try {
        pushBot(handleCommand(text, rows));
      } catch {
        pushBot("⚠️ Something went wrong handling that.");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#131313] flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-[#131313] relative">
        <header className="sticky top-0 z-10 bg-[#32a893] text-white px-3 py-2.5 flex items-center gap-3 shadow-md">
          <Link
            href="/"
            className="p-1 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-9 w-9 rounded-full bg-white/15 grid place-items-center font-bold text-sm">
            RS
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold leading-tight truncate">RS WinLo Bot</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
              {error ? "offline" : "online"}
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-2 bg-[#131313] pb-24">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          {typing && <Typing />}
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-[410px] mb-2  p-2 pointer-events-auto bg-[#131313]/80 backdrop-blur border-t border-white/5">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-[#1a1a1a] rounded-full px-4 py-2.5 flex items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={rows ? "Type a message…" : "Loading games…"}
                  disabled={!rows}
                  className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-gray-400"
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
              <button
                onClick={send}
                disabled={!canSend}
                aria-label="Send"
                className="h-11 w-11 shrink-0 rounded-full bg-[#32a893] text-white grid place-items-center shadow-lg shadow-[#32a893]/30 disabled:opacity-50 disabled:shadow-none active:scale-95 transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <SessionProvider>
      <Chat />
    </SessionProvider>
  );
}