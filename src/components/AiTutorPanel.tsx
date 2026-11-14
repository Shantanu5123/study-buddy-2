import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { TutorLaunchContext, TutorMessage } from '../types/study';
import { createId } from '../utils/textAnalysis';

interface AiTutorPanelProps {
  open: boolean;
  context: TutorLaunchContext | null;
  onClose: () => void;
}

export const AiTutorPanel: React.FC<AiTutorPanelProps> = ({
  open,
  context,
  onClose,
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastLaunchKeyRef = useRef<string>('');

  const sendTutorRequest = async (
    questionText: string,
    includeMissed: boolean,
    currentHistory: TutorMessage[]
  ) => {
    if (!context) return;
    setLoading(true);
    setError(null);

    const userMsg: TutorMessage = {
      id: createId('tu'),
      role: 'user',
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...currentHistory, userMsg];
    setMessages(updatedHistory);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          documentTitle: context.documentTitle,
          documentText: context.documentText,
          missedQuestion: includeMissed ? context.missedQuestion : undefined,
          history: currentHistory.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) {
        throw new Error(data.error || 'Could not get a response from AI Tutor.');
      }

      const modelMsg: TutorMessage = {
        id: createId('tm'),
        role: 'model',
        text: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to reach AI Tutor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !context) return;
    const launchKey = `${context.documentTitle}::${context.missedQuestion?.prompt || ''}::${context.autoPrompt || ''}`;
    if (lastLaunchKeyRef.current === launchKey) return;
    lastLaunchKeyRef.current = launchKey;

    setMessages([]);
    setError(null);

    if (context.missedQuestion) {
      const prompt =
        context.autoPrompt ||
        `Explain why I missed this question: "${context.missedQuestion.prompt}"`;
      void sendTutorRequest(prompt, true, []);
    } else if (context.autoPrompt) {
      void sendTutorRequest(context.autoPrompt, false, []);
    }
  }, [open, context]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!open || !context) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    void sendTutorRequest(q, false, messages);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#19172D]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-tutor-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="w-full max-w-md bg-white h-full border-l border-[#E6E4F0] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EAE8F2] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6A55DC]">
              <Bot className="w-4 h-4 shrink-0" />
              <span>AI Tutor</span>
            </div>
            <h2
              id="ai-tutor-title"
              className="text-base font-bold text-[#211E36] truncate mt-0.5"
            >
              {context.documentTitle}
            </h2>
            <p className="text-[11px] text-[#77758A]">
              Context-aware help grounded in your active study material
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#77758A] hover:bg-[#F4F3F8] hover:text-[#211E36]"
            aria-label="Close AI Tutor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missed question context banner */}
        {context.missedQuestion && (
          <div className="px-5 py-3 bg-[#FAF9FD] border-b border-[#EAE8F2] text-xs space-y-1">
            <p className="font-semibold text-[#B91C1C]">
              Missed Question: {context.missedQuestion.prompt}
            </p>
            <p className="text-[#5E5A75]">
              Selected: {context.missedQuestion.chosenAnswer} · Correct:{' '}
              <span className="font-semibold text-[#047857]">
                {context.missedQuestion.correctAnswer}
              </span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-[#F4F1FF] border border-[#E4DEFF] text-xs text-[#3E357A] leading-relaxed">
                Ask any question about <strong>{context.documentTitle}</strong>. Your active document text is included automatically so explanations stay focused on what you are studying.
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#77758A]">Suggested prompts</p>
                {[
                  'Summarize the 3 most important ideas from this material.',
                  'Explain the trickiest concept in simple everyday language.',
                  'Give me one quick practice question to test my understanding.',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendTutorRequest(prompt, false, messages)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-[#E6E4F0] bg-white text-xs font-medium text-[#2D2A42] hover:border-[#6A55DC] hover:bg-[#FAF9FD] flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6A55DC] shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[11px] text-[#8B889E] mb-1">
                {msg.role === 'user' ? 'You' : 'AI Tutor'} · {msg.time}
              </span>
              <div
                className={`max-w-[90%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#6A55DC] text-white'
                    : 'bg-[#FAF9FD] border border-[#EAE8F2] text-[#211E36]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="p-3 rounded-xl bg-[#FAF9FD] border border-[#EAE8F2] text-xs text-[#6E6B80]">
              Thinking through your study material...
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
              {error}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#EAE8F2] bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-[#E6E4F0] bg-[#FAF9FD] text-sm text-[#211E36] focus:outline-none focus:border-[#6A55DC]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-[#6A55DC] text-white hover:bg-[#5B47C7] disabled:opacity-50"
            aria-label="Send question to AI Tutor"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>
    </div>
  );
};
