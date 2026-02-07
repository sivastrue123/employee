import React, { useEffect, useState } from 'react';
import { Note } from '../types';

interface NoteFormProps {
  onSave: (note: Note) => void;
  initialNote?: Note;
  submitLabel?: string;
  onCancel?: () => void;
}

const buildInitialForm = (note?: Note) => ({
  title: note?.title ?? '',
  summary: note?.summary ?? '',
  dateTime: note
    ? new Date(note.dateTime).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16),
  type: note?.type ?? 'CustomerMeeting',
  participants: note?.participants.join(', ') ?? '',
  decisions: note?.decisions.join('\n') ?? '',
  risks: note?.risks.join('\n') ?? '',
  recordingUrl: note?.recordingUrl ?? '',
});

const NoteForm: React.FC<NoteFormProps> = ({ onSave, initialNote, submitLabel, onCancel }) => {
  const [form, setForm] = useState(buildInitialForm(initialNote));

  useEffect(() => {
    setForm(buildInitialForm(initialNote));
  }, [initialNote]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedParticipants = form.participants.split(',').map((p) => p.trim()).filter(Boolean);
    const normalizedDecisions = form.decisions.split('\n').map((item) => item.trim()).filter(Boolean);
    const normalizedRisks = form.risks.split('\n').map((item) => item.trim()).filter(Boolean);
    const recordingUrl = form.recordingUrl.trim() || undefined;

    if (initialNote) {
      const updatedNote: Note = {
        ...initialNote,
        title: form.title || initialNote.title,
        summary: form.summary,
        dateTime: new Date(form.dateTime).toISOString(),
        type: form.type as 'CustomerMeeting' | 'InternalDiscussion',
        participants: normalizedParticipants,
        decisions: normalizedDecisions,
        risks: normalizedRisks,
        recordingUrl,
      };
      onSave(updatedNote);
      return;
    }

    const note: Note = {
      id: `note-${Math.floor(Math.random() * 900) + 100}`,
      type: form.type as 'CustomerMeeting' | 'InternalDiscussion',
      title: form.title || 'Untitled note',
      dateTime: new Date(form.dateTime).toISOString(),
      participants: normalizedParticipants,
      summary: form.summary,
      decisions: normalizedDecisions,
      risks: normalizedRisks,
      tags: [],
      actionItems: [],
      linkedWorkItems: [],
      createdBy: 'u1',
      recordingUrl,
    };
    onSave(note);
    setForm(buildInitialForm());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-3">
      <div className="flex flex-col gap-1 text-sm">
        <label className="font-semibold text-slate-900">Note type</label>
        <select
          className="border rounded-2xl px-3 py-2"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <option value="CustomerMeeting">Customer Meeting</option>
          <option value="InternalDiscussion">Internal Discussion</option>
        </select>
      </div>
      <input
        className="border rounded-2xl px-3 py-2 w-full text-sm"
        placeholder="Title"
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 text-sm">
          <label className="font-semibold text-slate-900">Date & time</label>
          <input
            type="datetime-local"
            className="border rounded-2xl px-3 py-2"
            value={form.dateTime}
            onChange={(e) => handleChange('dateTime', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <label className="font-semibold text-slate-900">Participants (comma separated)</label>
          <input
            type="text"
            className="border rounded-2xl px-3 py-2"
            value={form.participants}
            onChange={(e) => handleChange('participants', e.target.value)}
            placeholder="Name, email"
          />
        </div>
      </div>
      <textarea
        className="border rounded-2xl px-3 py-2 w-full text-sm min-h-[80px]"
        placeholder="Summary"
        value={form.summary}
        onChange={(e) => handleChange('summary', e.target.value)}
      />
      <input
        type="url"
        className="border rounded-2xl px-3 py-2 w-full text-sm"
        placeholder="Recording URL (optional)"
        value={form.recordingUrl}
        onChange={(e) => handleChange('recordingUrl', e.target.value)}
      />
      <textarea
        className="border rounded-2xl px-3 py-2 w-full text-sm min-h-[60px]"
        placeholder="Decisions (one per line)"
        value={form.decisions}
        onChange={(e) => handleChange('decisions', e.target.value)}
      />
      <textarea
        className="border rounded-2xl px-3 py-2 w-full text-sm min-h-[60px]"
        placeholder="Risks (one per line)"
        value={form.risks}
        onChange={(e) => handleChange('risks', e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full">
          {submitLabel ?? (initialNote ? 'Save changes' : 'Save note')}
        </button>
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-600"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default NoteForm;

