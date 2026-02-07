import React, { useMemo, useState } from 'react';
import { useAppData } from '../context/DataContext';

type ChatEntry = {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
};

const formatOwner = (ownerId: string | undefined, users: { id: string; name: string }[]) => {
  if (!ownerId) return 'Unassigned';
  const user = users.find((item) => item.id === ownerId);
  return user ? user.name : 'Unassigned';
};

const AIAssistant: React.FC = () => {
  const { workItems, notes, users } = useAppData();
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<ChatEntry[]>([
    {
      role: 'assistant',
      text: 'Hi! Ask about work items, notes, users, or active tasks and I will bring up structured results.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return { workItems: [], notes: [], users: [], tasks: [] };
    const matchesItems = workItems
      .filter((item) =>
        [item.id, item.title, item.description, item.customer ?? '', item.project ?? '', item.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 5);
    const matchesNotes = notes
      .filter((note) =>
        [note.title, note.summary, note.decisions.join(' '), note.risks.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 3);
    const matchesUsers = users
      .filter((user) => [user.name, user.role, user.teamId].join(' ').toLowerCase().includes(normalizedQuery))
      .slice(0, 4);
    const matchesTasks = workItems
      .filter((item) => ['InProgress', 'New', 'Triaged'].includes(item.status))
      .filter((item) =>
        [item.title, item.status, item.ownerId ?? ''].join(' ').toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 5);
    return { workItems: matchesItems, notes: matchesNotes, users: matchesUsers, tasks: matchesTasks };
  }, [normalizedQuery, workItems, notes, users]);

  const buildResponse = () => {
    if (!normalizedQuery) return 'Describe what you need—work items, notes, users, or tasks.';

    if (
      !searchResults.workItems.length &&
      !searchResults.notes.length &&
      !searchResults.users.length &&
      !searchResults.tasks.length
    ) {
      return `⚠️ No records found for "${query}". Try another keyword or filter.`;
    }

    const sections: string[] = [];
    if (searchResults.workItems.length) {
      const lines = searchResults.workItems.map(
        (item) =>
          `• ${item.id} — ${item.title} (${item.status}) due ${
            item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBD'
          } · Owner ${formatOwner(item.ownerId, users)}`,
      );
      sections.push(`🗂 Work Items (${searchResults.workItems.length}):\n${lines.join('\n')}`);
    }
    if (searchResults.notes.length) {
      const lines = searchResults.notes.map(
        (note) => `• ${note.title} (${note.type === 'CustomerMeeting' ? 'Customer meeting' : 'Internal discussion'})`,
      );
      sections.push(`📝 Notes (${searchResults.notes.length}):\n${lines.join('\n')}`);
    }
    if (searchResults.users.length) {
      const lines = searchResults.users.map((user) => `• ${user.name} — ${user.role}`);
      sections.push(`👤 Users (${searchResults.users.length}):\n${lines.join('\n')}`);
    }
    if (searchResults.tasks.length) {
      const lines = searchResults.tasks.map((item) => `• ${item.title} — ${item.priority} priority (${item.status})`);
      sections.push(`🧭 Active Tasks (${searchResults.tasks.length}):\n${lines.join('\n')}`);
    }
    return sections.join('\n\n');
  };

  const handleSend = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setConversation((prev) => [
      ...prev,
      { role: 'user', text: trimmed, timestamp },
      { role: 'assistant', text: buildResponse(), timestamp },
    ]);
    setQuery('');
  };

  const bubbleStyle = (role: ChatEntry['role']) =>
    role === 'user'
      ? 'self-end bg-slate-900 text-white'
      : 'self-start bg-white text-slate-900 shadow-sm border border-white/30';

  const suggestions = [
    'Show my active tasks',
    'List work items assigned to Gomathi',
    'Find notes related to the customer roadmap',
    'Show all active users',
  ];

  return (
    <section className="flex flex-col h-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-800">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WorkHub Assistant</p>
          <p className="text-lg font-semibold text-white">Natural language explorer</p>
        </div>
        <span className="text-xs text-slate-400">{new Date().toLocaleTimeString()}</span>
      </header>
      <div className="px-6 py-3 text-xs text-slate-300">
        <p className="mb-2">Try these:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[0.7rem]"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {conversation.map((entry, index) => (
          <div key={`${entry.role}-${index}`} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${bubbleStyle(entry.role)}`}>
            <p className="text-[0.65rem] uppercase tracking-[0.4em] mb-1 text-slate-400">{entry.role}</p>
            <pre className="whitespace-pre-wrap">{entry.text}</pre>
          </div>
        ))}
      </div>
      <footer className="px-6 py-4 border-t border-slate-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 rounded-full border border-slate-800 px-4 py-2 text-sm bg-slate-900 text-white focus:border-white focus:outline-none"
            placeholder="Search work items, notes, users, or tasks..."
          />
          <button
            className="rounded-full bg-indigo-500 hover:bg-indigo-400 px-5 py-2 text-sm font-semibold text-white shadow"
            onClick={handleSend}
            type="button"
          >
            Send
          </button>
        </div>
      </footer>
    </section>
  );
};

export default AIAssistant;

