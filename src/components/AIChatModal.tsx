import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  ChefHat, 
  Flame, 
  Pizza, 
  Bot, 
  User, 
  Plus, 
  Check, 
  Loader2,
  ArrowDown,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Task, Project } from '../types';

interface AIChatModalProps {
  isOpen?: boolean;
  isInlineView?: boolean;
  onClose?: () => void;
  tasks: Task[];
  projects: Project[];
  onAddTaskFromAI?: (task: Task) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen = true,
  isInlineView = false,
  onClose,
  tasks,
  projects,
  onAddTaskFromAI,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('pb_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 **Welcome to the Pizza & Burger Operations AI Assistant!**

I am your kitchen copilot, culinary strategist, and equipment triage specialist. I can help you:
- **Organize & schedule prep work** (dough proofing, burger griddle timing, sauce batches)
- **Prioritize the rush-hour queue** to avoid ticket bottlenecks
- **Diagnose equipment bugs** like deck oven thermocouple drifts or KDS printer delays
- **Summarize shift progress** for managers and kitchen leads

What would you like to optimize on the line today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('pb_ai_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    '🔥 What should the kitchen prioritize for the 7 PM rush?',
    '🍕 Generate a prep checklist for 48h cold dough fermentation',
    '🍔 How do we optimize smash burger sear & toast station flow?',
    '🐞 Help troubleshoot pizza deck oven Zone 2 temperature drift',
    '📋 Summarize today’s progress and remaining prep blockers',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const activeTaskTitles = tasks
        .filter((t) => t.status !== 'done')
        .slice(0, 6)
        .map((t) => `[${t.priority.toUpperCase()}] ${t.title}`);

      const criticalCount = tasks.filter((t) => t.priority === 'critical' && t.status !== 'done').length;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages.slice(-8),
          currentContext: {
            taskCount: tasks.length,
            completedCount: tasks.filter((t) => t.status === 'done').length,
            criticalCount,
            projectNames: projects.map((p) => p.name),
            activeTaskTitles,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`AI service responded with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I've reviewed the operational queue. Let me know if you need more task breakdowns!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const fallbackMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `**Operational Recommendation for Peak Flow:**
1. **Critical:** Check Zone 2 pizza deck oven thermocouple before high volume orders roll in.
2. **Dough Proofing:** Ensure the walk-in dough retarder holds at 38°F so dough balls don't over-ferment.
3. **Burger Station:** Keep the flat-top griddle seasoned at 410°F and preheat cast-iron smash presses.
Let me know if you would like me to generate a new task for any of these!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('pb_ai_chat_history');
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: '👋 Chat history cleared. What culinary or operational task can I assist with?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const contentUI = (
    <div className="flex flex-col h-full bg-neutral-950/80 rounded-2xl border border-neutral-800 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-neutral-950 font-black shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-100">AI Kitchen &amp; Ops Assistant</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Live context linked with {tasks.length} active tasks &amp; {projects.length} projects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!isInlineView && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChefHat className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none shadow-sm'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-body prose prose-invert prose-xs max-w-none text-neutral-200">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    isUser ? 'text-amber-950/70 font-semibold' : 'text-neutral-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <ChefHat className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Analyzing prep stations and kitchen workflow...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-neutral-900/40 border-t border-neutral-800/80 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-amber-300 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-neutral-900/90 border-t border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to prioritize rush work, troubleshoot line bugs, or draft tasks..."
            disabled={loading}
            className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );

  if (isInlineView) {
    return <div className="h-[calc(100vh-140px)] animate-in fade-in duration-300">{contentUI}</div>;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl h-[85vh] max-h-[750px] shadow-2xl">
        {contentUI}
      </div>
    </div>
  );
};
