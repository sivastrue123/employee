import React, { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/DataContext';
import NoteForm from '../components/NoteForm';
import WorkItemForm from '../components/WorkItemForm';
import { Note, WorkItem } from '../types';

const NOTE_TYPES = ['CustomerMeeting', 'InternalDiscussion'] as const;
const NOTES_PER_PAGE = 4;

const Notes: React.FC = () => {
  const { notes, updateNote, teams, users, slaPolicies, departments, addWorkItem, addNote } = useAppData();
  const [filters, setFilters] = useState({ type: '', keyword: '' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setMonth(defaultStart.getMonth() - 3);
  const defaultEnd = new Date(today);
  defaultEnd.setMonth(defaultEnd.getMonth() + 3);
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({
    from: formatDate(defaultStart),
    to: formatDate(defaultEnd),
  });

  const filteredNotes = useMemo(() => {
    const fromDate = dateRange.from ? new Date(dateRange.from) : null;
    const toDate = dateRange.to ? new Date(dateRange.to) : null;
    return notes.filter((note) => {
      if (filters.type && note.type !== filters.type) return false;
      if (filters.keyword) {
        const haystack = [note.title, note.summary, ...note.decisions, ...note.risks].join(' ').toLowerCase();
        if (!haystack.includes(filters.keyword.toLowerCase())) return false;
      }
      const noteDate = new Date(note.dateTime);
      if (fromDate && noteDate < fromDate) return false;
      if (toDate && noteDate > toDate) return false;
      return true;
    });
  }, [notes, filters, dateRange]);

  const [notePage, setNotePage] = useState(1);
  const visibleNotes = filteredNotes.slice(0, notePage * NOTES_PER_PAGE);
  const hasMoreNotes = visibleNotes.length < filteredNotes.length;

  useEffect(() => {
    setNotePage(1);
  }, [filters, dateRange]);

  const hasFilter = !!filters.type || !!filters.keyword || !!dateRange.from || !!dateRange.to;
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="space-y-6">
      <header className="space-y-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Meeting Notes</p>
          <h1 className="text-3xl font-semibold text-slate-900">Capture and manage discussions</h1>
          <p className="text-sm text-slate-500">
            Filter or search through notes to reveal actions, decisions, and related work items. Fill in at least one
            field to see the gallery.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="!px-4 !py-2 !rounded-full !bg-slate-900 !text-white !text-sm !font-semibold !shadow"
            onClick={() => setShowNoteForm((prev) => !prev)}
          >
            + New Note
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
          >
            <option value="">Filter by note type</option>
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'CustomerMeeting' ? 'Customer meeting' : 'Internal discussion'}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            placeholder="Search keywords"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
          />
          <input
            type="date"
            className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            value={dateRange.from}
            onChange={(event) => setDateRange((prev) => ({ ...prev, from: event.target.value }))}
          />
          <input
            type="date"
            className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            value={dateRange.to}
            onChange={(event) => setDateRange((prev) => ({ ...prev, to: event.target.value }))}
          />
          <button
            type="button"
            onClick={() => setFilters({ type: '', keyword: '' })}
            className="!text-sm !font-semibold !text-indigo-600"
          >
            Reset filters
          </button>
        </div>
      </header>

      {showNoteForm && (
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <NoteForm
            onSave={(note) => {
              addNote(note);
              setShowNoteForm(false);
            }}
            onCancel={() => setShowNoteForm(false)}
          />
        </section>
      )}

      {selectedNote ? (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setSelectedNote(null)}
            className="!inline-flex !items-center !gap-2 !text-sm !font-semibold !text-slate-600"
          >
            <span aria-hidden>←</span>
            Back to notes
          </button>
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {selectedNote.type === 'CustomerMeeting' ? 'Customer meeting' : 'Internal discussion'}
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">{selectedNote.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>{new Date(selectedNote.dateTime).toLocaleString()}</span>
                  {selectedNote.customer && <span>{selectedNote.customer}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNote.participants.map((participant) => (
                  <span key={participant} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {participant}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Summary</p>
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{selectedNote.summary}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Key Decisions</p>
                <div className="space-y-2">
                  {selectedNote.decisions.map((decision) => (
                    <div key={decision} className="rounded-2xl bg-emerald-50 px-4 py-3 text-slate-900">
                      {decision}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase text-slate-400">Identified Risks</p>
                <div className="space-y-2">
                  {selectedNote.risks.map((risk) => (
                    <div key={risk} className="rounded-2xl bg-amber-50 px-4 py-3 text-slate-900">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNote.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </section>
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">Action Items</h3>
              <button
                type="button"
                onClick={() => setShowTaskForm(true)}
                className="!px-3 !py-1 !rounded-full !text-xs !font-semibold !shadow !bg-slate-900 !text-white !flex !items-center !gap-2"
              >
                <span className="h-3 w-3" aria-hidden>+</span>
                Create task
              </button>
            </div>
            {selectedNote.actionItems.length ? (
              <div className="space-y-3">
                {selectedNote.actionItems.map((action, idx) => {
                  const [labelPart] = action.split('·');
                  const matches = labelPart?.match(/Work item:\s*([A-Za-z0-9-]+)/);
                  const workItemId = matches ? matches[1] : undefined;
                  const openWorkItem = () => {
                    if (workItemId) {
                      window.location.href = `/workitems?id=${encodeURIComponent(workItemId)}`;
                    } else {
                      alert('Work item not available');
                    }
                  };
                  return (
                    <div
                      key={`${action}-${idx}`}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 flex items-center justify-between gap-3"
                    >
                      <span>{action}</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="!px-3 !py-1 !text-xs !font-semibold !rounded-full !border !border-slate-200 !text-slate-600 hover:!bg-slate-100 !transition"
                          onClick={openWorkItem}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="!px-3 !py-1 !text-xs !font-semibold !rounded-full !border !border-indigo-200 !bg-indigo-50 !text-indigo-600 hover:!bg-indigo-100 !transition"
                          onClick={openWorkItem}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No action items yet.</p>
            )}
          </section>
          {showTaskForm && (
            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Create linked work item</h3>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="!px-3 !py-1 !rounded-full !text-xs !font-semibold !text-slate-600 !border !border-slate-200"
                >
                  Close
                </button>
              </div>
              <WorkItemForm
                teams={teams}
                users={users}
                slaPolicies={slaPolicies}
                departments={departments}
                onSave={(item: WorkItem) => {
                  addWorkItem(item);
                  if (selectedNote) {
                    const taskLabel = `Work item: ${item.id} · ${item.title}`;
                    const updatedActions = [...selectedNote.actionItems, taskLabel];
                    updateNote(selectedNote.id, { actionItems: updatedActions });
                    setSelectedNote({ ...selectedNote, actionItems: updatedActions });
                  }
                  setShowTaskForm(false);
                }}
                autoFocus
              />
            </section>
          )}
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hasFilter ? (
              filteredNotes.length ? (
                visibleNotes.map((note) => {
                  if (editingNoteId === note.id) {
                    return (
                      <div key={`edit-${note.id}`} className="col-span-full">
                        <NoteForm
                          initialNote={note}
                          submitLabel="Save changes"
                          onSave={(updated) => {
                            updateNote(note.id, updated);
                            setEditingNoteId(null);
                          }}
                          onCancel={() => setEditingNoteId(null)}
                        />
                      </div>
                    );
                  }
                  return (
                    <article
                      key={note.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3 cursor-pointer hover:shadow-lg transition"
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
                          {note.type === 'CustomerMeeting' ? 'Customer' : 'Internal'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{new Date(note.dateTime).toLocaleDateString()}</span>
                          <button
                            type="button"
                            className="!text-xs !font-semibold !text-indigo-600 !underline"
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditingNoteId(note.id);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">{note.title}</h2>
                      <p className="text-sm text-slate-500">{note.summary}</p>
                      {note.recordingUrl && (
                        <a
                          href={note.recordingUrl}
                          className="text-xs font-semibold text-indigo-600"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View recording
                        </a>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {note.participants.slice(0, 3).map((participant) => (
                          <span key={participant} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
                            {participant}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p className="font-semibold text-slate-800">Key Decisions</p>
                        <ul className="list-disc list-inside space-y-1">
                          {note.decisions.map((decision) => (
                            <li key={decision}>{decision}</li>
                          ))}
                        </ul>
                        <p className="font-semibold text-slate-800">Identified Risks</p>
                        <ul className="list-disc list-inside space-y-1">
                          {note.risks.map((risk) => (
                            <li key={risk}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500 col-span-full">
                  No notes match the selected filters. Try expanding the keyword or switching the meeting type.
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500 col-span-full">
                Apply a filter or search term to reveal note cards.
              </div>
            )}
          </section>
          {hasMoreNotes && (
            <div className="flex justify-center">
              <button
                className="!px-4 !py-2 !rounded-full !border !border-slate-300 !text-sm !font-semibold !text-slate-700 hover:!bg-slate-100 !transition"
                onClick={() => setNotePage((prev) => prev + 1)}
              >
                Load more notes
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Notes;

