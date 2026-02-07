import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Environment,
  SlaPolicy,
  Team,
  User,
  WorkItem,
  WorkItemPriority,
  WorkItemStatus,
  WorkItemType,
} from '../types';

interface WorkItemFormProps {
  teams: Team[];
  users: User[];
  slaPolicies: SlaPolicy[];
  departments: string[];
  onSave: (item: WorkItem) => void;
  autoFocus?: boolean;
}

const DEFAULT_TYPE: WorkItemType = 'InternalDev';
const DEFAULT_PRIORITY: WorkItemPriority = 'P2';
const DEFAULT_STATUS: WorkItemStatus = 'New';
const DEFAULT_ENV: Environment = 'Dev';

const WorkItemForm: React.FC<WorkItemFormProps> = ({ teams, users, slaPolicies, departments, onSave, autoFocus }) => {
  const [form, setForm] = useState({
    workItemType: DEFAULT_TYPE,
    title: '',
    description: '',
    customer: '',
    project: '',
    priority: DEFAULT_PRIORITY,
    status: DEFAULT_STATUS,
    slaPolicyId: slaPolicies[0]?.id ?? 'default',
    teamId: teams[0]?.id ?? 'eng',
    ownerId: users[0]?.id ?? '',
    dueDate: '',
    effortEstimate: 8,
    environment: DEFAULT_ENV,
    department: '',
  });

  const uniqueUsers = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => {
      if (!map.has(user.id)) {
        map.set(user.id, user);
      }
    });
    return Array.from(map.values());
  }, [users]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newId = `${form.workItemType.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`;
    const timestamp = new Date().toISOString();
    const workItem: WorkItem = {
      id: newId,
      workItemType: form.workItemType,
      title: form.title || 'New work item',
      description: form.description,
      customer: form.customer || undefined,
      project: form.project || undefined,
      module: '',
      priority: form.priority,
      status: form.status,
      slaPolicyId: form.slaPolicyId,
      teamId: form.teamId,
      ownerId: form.ownerId,
      approverId: '',
      plannedStart: timestamp,
      dueDate: form.dueDate || undefined,
      actualStart: undefined,
      actualEnd: undefined,
      effortEstimate: Number(form.effortEstimate),
      effortSpent: 0,
      tags: [],
      components: [],
      environment: form.environment,
    department: form.department || undefined,
      dependencies: [],
      attachments: [],
      checklist: [],
      comments: [],
      slaEvents: [],
      slaState: 'WithinSLA',
      auditLog: [
        {
          id: `${newId}-audit`,
          action: 'Created',
          actorId: form.ownerId,
          detail: 'Work item created via quick form',
          timestamp,
        },
      ],
      createdBy: form.ownerId,
      createdAt: timestamp,
      modifiedBy: form.ownerId,
      modifiedAt: timestamp,
    };

    onSave(workItem);
    setForm((prev) => ({
      ...prev,
      title: '',
      description: '',
      customer: '',
      project: '',
      dueDate: '',
      effortEstimate: 8,
      department: '',
    }));
  };

  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) {
      titleRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <form className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Quick work item</p>
          <p className="text-xs text-slate-500">Create a new entry for the unified backlog.</p>
        </div>
        <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full">
          Save
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={form.workItemType}
          onChange={(e) => handleChange('workItemType', e.target.value as WorkItemType)}
        >
          <option value="InternalDev">Internal Dev</option>
          <option value="CustomerSupport">Customer Support</option>
          <option value="Feature">Feature</option>
          <option value="ChangeRequest">Change Request</option>
          <option value="Release">Release</option>
          <option value="AITools">AI Tools</option>
          <option value="MeetingAction">Meeting Action</option>
          <option value="DiscussionAction">Discussion Action</option>
        </select>
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={form.priority}
          onChange={(e) => handleChange('priority', e.target.value as WorkItemPriority)}
        >
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select
          className="border rounded-xl px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => handleChange('status', e.target.value as WorkItemStatus)}
        >
          <option value="New">New</option>
          <option value="Triaged">Triaged</option>
          <option value="InProgress">In Progress</option>
          <option value="QA">QA</option>
          <option value="UAT">UAT</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>
      <input
        ref={titleRef}
        type="text"
        className="border rounded-2xl px-3 py-2 text-sm w-full"
        placeholder="Title"
        value={form.title}
        onChange={(e) => handleChange('title', e.target.value)}
        required
      />
      <textarea
        className="border rounded-2xl px-3 py-2 text-sm w-full resize-none min-h-[80px]"
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <select
          className="border rounded-xl px-3 py-2"
          value={form.teamId}
          onChange={(e) => handleChange('teamId', e.target.value)}
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded-xl px-3 py-2"
          value={form.ownerId}
          onChange={(e) => handleChange('ownerId', e.target.value)}
        >
          <option value="">Select owner</option>
          {uniqueUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        <select
          className="border rounded-xl px-3 py-2"
          value={form.slaPolicyId}
          onChange={(e) => handleChange('slaPolicyId', e.target.value)}
        >
          {slaPolicies.map((policy) => (
            <option key={policy.id} value={policy.id}>
              {policy.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded-xl px-3 py-2"
          value={form.department}
          onChange={(e) => handleChange('department', e.target.value)}
        >
          <option value="">Department (optional)</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <input
          type="date"
          className="border rounded-2xl px-3 py-2"
          value={form.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />
        <input
          type="number"
          min={0}
          className="border rounded-2xl px-3 py-2"
          value={form.effortEstimate}
          onChange={(e) => handleChange('effortEstimate', Number(e.target.value))}
        />
      </div>
    </form>
  );
};

export default WorkItemForm;

