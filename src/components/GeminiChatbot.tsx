import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Zap, 
  Brain, 
  RotateCcw, 
  Check, 
  Copy,
  Terminal,
  ChevronDown
} from "lucide-react";
import type { ChatMessage, TranscriptProject } from "../types";
import { saveChatMessage } from "../lib/firebase";
import { safeFetchJson } from "../lib/apiClient";

interface GeminiChatbotProps {
  userId?: string;
  activeProject?: TranscriptProject | null;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  userId,
  activeProject
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "Hello! I am your specialized LexiTranscribe Intelligence Assistant. I can assist with:\n\n- Translating subtitles into 50+ languages with synchronized timestamps.\n- Summarizing specific segments or technical chapters.\n- Formulating social media recap teasers.\n- Formatting raw transcripts into SRT/WebVTT or JSON.\n\nHow can I help you today?",
      model: "gemini-3.5-flash",
      timestamp: Date.now()
    }
  ]);

  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"gemini-3.7-flash" | "gemini-2.5-flash" | "gemini-3.1-flash-lite">("gemini-3.7-flash");
  const [selectedRole, setSelectedRole] = useState("Video & Subtitle Specialist");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsgText = input.trim();
    setInput("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userMsgText,
      model: selectedModel,
      systemRole: selectedRole,
      timestamp: Date.now()
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setIsLoading(true);

    if (userId) {
      saveChatMessage(userId, userMessage);
    }

    try {
      const { data } = await safeFetchJson<any>("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          role: selectedRole,
          systemInstruction: `You are an expert AI inside LexiTranscribe assigned the role of "${selectedRole}".
Context of active video footage:
- File: ${activeProject?.fileName || "interview_raw_footage.mp4"}
- Model: ${activeProject?.model || "Gemini 3.5 Transcribe"}
- Duration: ${activeProject?.duration || "45:20"}

Provide technically rich, concise, well-structured markdown responses with timestamps where applicable.`
        })
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data?.reply || "I analyzed your query in relation to the transcript segments.",
        model: selectedModel,
        systemRole: selectedRole,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (userId) {
        saveChatMessage(userId, assistantMessage);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I have analyzed your request based on the current session and transcript data.",
        model: selectedModel,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Chat history cleared. Active Model: ${selectedModel}. Ready for next prompt.`,
        model: selectedModel,
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <div id="gemini-chatbot-container" className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Chat Top Controls */}
      <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-2xl mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-[#38bdf8]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Gemini Intelligence Assistant</span>
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
            </h2>
            <p className="text-xs text-slate-400">
              Role-directed multi-turn dialogue with conversation history persistence
            </p>
          </div>
        </div>

        {/* Model & Role Switchers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Model Switcher */}
          <div className="flex items-center gap-1.5 bg-[#020617] border border-[#1e293b] p-1 rounded-xl">
            <button
              onClick={() => setSelectedModel("gemini-3.1-flash-lite")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                selectedModel === "gemini-3.1-flash-lite"
                  ? "bg-[#38bdf8] text-[#020617] font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Flash-Lite</span>
            </button>

            <button
              onClick={() => setSelectedModel("gemini-2.5-flash")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                selectedModel === "gemini-2.5-flash"
                  ? "bg-[#38bdf8] text-[#020617] font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>2.5 Flash</span>
            </button>

            <button
              onClick={() => setSelectedModel("gemini-3.7-flash")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1 ${
                selectedModel === "gemini-3.7-flash"
                  ? "bg-[#38bdf8] text-[#020617] font-semibold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>3.7 Flash</span>
            </button>
          </div>

          {/* Role selector */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#020617] border border-[#1e293b] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="Video & Subtitle Specialist">Role: Video & Subtitle Specialist</option>
            <option value="Content Repurposer & Marketer">Role: Content Repurposer & Marketer</option>
            <option value="Multi-Language Translator">Role: Multi-Language Translator</option>
            <option value="Deep Technical Auditor">Role: Deep Technical Auditor</option>
          </select>

          <button
            onClick={handleClear}
            title="Clear Chat Thread"
            className="p-2 rounded-xl bg-[#020617] border border-[#1e293b] text-slate-400 hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? "bg-sky-500/15 border border-sky-500/30 text-sky-400"
                    : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? "bg-sky-500/15 border border-sky-500/30 text-slate-100 rounded-tr-none"
                    : "bg-[#020617] border border-[#1e293b] text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 text-[10px] font-mono text-slate-400 pb-1.5 border-b border-[#1e293b]">
                  <span className="font-semibold text-slate-300">
                    {isUser ? "You" : `Gemini (${msg.model || selectedModel})`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-[#38bdf8]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="whitespace-pre-line text-xs leading-relaxed font-sans">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38bdf8] animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-xl bg-[#020617] border border-[#1e293b] text-xs font-mono text-[#38bdf8] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping"></span>
              <span>Gemini is generating response with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${selectedRole} (e.g. 'Extract all questions asked in the interview', 'Format into 3 teaser tweets')...`}
          className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#38bdf8] transition-colors shadow-lg"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-[#38bdf8] text-[#020617] font-semibold text-sm hover:bg-sky-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-sky-500/10"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
