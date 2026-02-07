import React from 'react';
import { WorkItem } from '../types';

interface WorkItemDetailProps {
  item: WorkItem;
  onClose: () => void;
}

const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-600"
        >
          Close
        </button>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{item.workItemType}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{item.title}</h2>
          <p className="text-sm text-slate-500">Priority {item.priority} · Status {item.status}</p>
        </div>
        <p className="text-sm text-slate-600">{item.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Team</p>
            <p className="text-base font-semibold text-slate-900">{item.teamId || 'Unassigned'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Owner</p>
            <p className="text-base font-semibold text-slate-900">{item.ownerId || 'Unassigned'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">SLA State</p>
            <p className="text-base font-semibold text-slate-900">{item.slaState}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Dates</p>
            <p className="text-sm text-slate-600">
              Planned: {item.plannedStart ? new Date(item.plannedStart).toLocaleDateString() : 'TBD'}
            </p>
            <p className="text-sm text-slate-600">
              Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBD'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Effort</p>
            <p className="text-sm text-slate-600">
              Estimate {item.effortEstimate}h · Spent {item.effortSpent}h
            </p>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase text-slate-400">Tags & components</p>
          <div className="flex flex-wrap gap-2">
            {[...item.tags, ...item.components].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
          {item.dependencies.length > 0 && (
            <>
              <p className="text-xs uppercase text-slate-400">Dependencies</p>
              <ul className="list-disc list-inside text-slate-700">
                {item.dependencies.map((dep) => (
                  <li key={dep}>{dep}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkItemDetail;

