import React from 'react';
import { Note } from '../types';

interface NoteDetailProps {
  note: Note;
  onClose: () => void;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ note, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-600"
        >
          Close
        </button>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            {note.type === 'CustomerMeeting' ? 'Customer Meeting' : 'Internal Discussion'}
          </p>
          <h2 className="text-2xl font-semibold text-slate-900">{note.title}</h2>
          <p className="text-sm text-slate-500">{new Date(note.dateTime).toLocaleString()}</p>
        </div>
        <p className="text-sm text-slate-600">{note.summary}</p>
        <div className="flex flex-wrap gap-2">
          {note.participants.map((participant) => (
            <span key={participant} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
              {participant}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase text-slate-400">Key Decisions</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {note.decisions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase text-slate-400">Risks</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {note.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        {note.actionItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase text-slate-400">Action items</p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {note.actionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {note.recordingUrl && (
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recording</p>
            <a
              href={note.recordingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-indigo-600 underline"
            >
              {note.recordingUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;

