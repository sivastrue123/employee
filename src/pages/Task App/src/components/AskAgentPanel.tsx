import React, { useState } from 'react';
import { useAppData } from '../context/DataContext';
import { useUI } from '../context/UIContext';

interface AgentMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: { id: string; type: string; summary: string; timestamp: string }[];
}

const suggestions = [
  'Summarize weekly progress',
  'Show SLA risk items',
  'Create a new task',
];

const AskAgentPanel: React.FC = () => {
  const { askAgent } = useAppData();
  const { isAgentOpen, closeAgent } = useUI();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<AgentMessage[]>([
    { role: 'assistant', text: 'How can I help you today? Ask me about work items, notes, or worklogs.' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isAgentOpen) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setConversation((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    const response = askAgent(text, 'u1');
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', text: response.answer, sources: response.sources },
      ]);
      setInput('');
      setLoading(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="w-[360px] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-indigo-500 to-calm-teal px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">AI Work Assistant</p>
              <p className="text-xs text-white/80">Powered by WorkHub data</p>
            </div>
            <button className="text-xs text-white/70" onClick={closeAgent}>
              Close
            </button>
          </div>
        </header>
        <div className="p-5 space-y-4">
          <div className="flex flex-col space-y-2 text-slate-700">
            <p className="text-lg font-semibold">How can I help you today?</p>
            <p className="text-sm text-slate-500">I can help with tasks, notes, worklogs, and summaries.</p>
          </div>
          <div className="space-y-2">
            {suggestions.map((label) => (
              <button
                key={label}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-600 hover:border-slate-300"
                onClick={() => {
                  setInput(label);
                  handleSend();
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex-1 max-h-40 overflow-y-auto space-y-2">
              {conversation.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    msg.role === 'user' ? 'bg-slate-100 text-slate-800 self-end' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.sources?.length && (
                    <p className="text-[0.65rem] text-slate-500 mt-1">
                      Sources: {msg.sources.map((s) => `${s.type} ${s.id}`).join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <footer className="px-5 py-4 border-t border-slate-200 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:bg-slate-300"
            disabled={loading}
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AskAgentPanel;

