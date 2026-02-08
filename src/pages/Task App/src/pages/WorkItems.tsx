import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppData } from '../context/DataContext';
import WorkItemForm from '../components/WorkItemForm';
import DateRangeSelector from '../components/DateRangeSelector';
import { WorkItem, ChecklistItem, User, WorkItemStatus, ActionItem } from '../types';
import { designTokens } from '../designTokens';

type ViewMode = 'table' | 'kanban';
const formatMinutes = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const WORK_ITEMS_PER_PAGE = 10;

const WORK_ITEM_STATUSES: WorkItemStatus[] = [
  'New',
  'Triaged',
  'InProgress',
  'Blocked',
  'QA',
  'UAT',
  'Delivered',
  'Closed',
  'Rejected',
  'OnHold',
];

const WorkItems: React.FC = () => {
  const PlusIcon = () => (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const {
    filteredWorkItems,
    filters,
    setFilters,
    computeSlaSummary,
    addWorkItem,
    updateWorkItem,
    users,
    teams,
    slaPolicies,
    departments,
    addWorklogEntry,
    currentUserId,
    getLogsForWorkItem,
    totalLoggedMinutesFor,
  } = useAppData();
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => {
      if (!map.has(user.id)) {
        map.set(user.id, user);
      }
    });
    return Array.from(map.values());
  }, [users]);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailChecklist, setDetailChecklist] = useState<ChecklistItem[]>([]);
  const [detailForm, setDetailForm] = useState({
    title: '',
    description: '',
    status: 'New' as WorkItem['status'],
    priority: 'P2' as WorkItem['priority'],
    ownerId: '',
    dueDate: '',
    department: '',
    slaPolicyId: '',
  });
  const [detailActionItems, setDetailActionItems] = useState<ActionItem[]>([]);
  const [actionItemForm, setActionItemForm] = useState({
    description: '',
    assigneeId: '',
  });
  const [checklistForm, setChecklistForm] = useState({ title: '', assigneeId: '' });
  const [showActionForm, setShowActionForm] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const worklogActivities = ['Development', 'Planning', 'Testing', 'Review', 'Support'];
  const [worklogForm, setWorklogForm] = useState({
    activityType: worklogActivities[0],
    hours: '1',
    date: new Date().toISOString().split('T')[0],
    description: '',
    userId: currentUserId,
  });
  const [showWorklogForm, setShowWorklogForm] = useState(false);
  const worklogFormRef = React.useRef<HTMLDivElement>(null);
  const kanbanDetailRef = React.useRef<HTMLDivElement>(null);
  const kanbanBoardRef = React.useRef<HTMLDivElement>(null);
  const columnRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const [workPage, setWorkPage] = useState(1);
  const typeCounts = useMemo(() => {
    return filteredWorkItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.workItemType] = (acc[item.workItemType] ?? 0) + 1;
      return acc;
    }, {});
  }, [filteredWorkItems]);

  const filteredTableItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return filteredWorkItems.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
  }, [filteredWorkItems, searchTerm]);
  const visibleTableItems = useMemo(
    () => filteredTableItems.slice(0, workPage * WORK_ITEMS_PER_PAGE),
    [filteredTableItems, workPage],
  );
  useEffect(() => {
    setWorkPage(1);
  }, [searchTerm, filteredWorkItems]);

  const formatOwner = (ownerId: string | undefined) => {
    if (!ownerId) return 'Unassigned';
    return users.find((user) => user.id === ownerId)?.name ?? 'Unassigned';
  };

  const teamMembersFor = (teamId?: string): User[] => {
    const team = teams.find((entry) => entry.id === teamId);
    if (!team) return [];
    const seenIds = new Set<string>();
    return team.members
      .map((memberId) => uniqueUsers.find((user) => user.id === memberId))
      .filter((user): user is User => {
        if (!user || seenIds.has(user.id)) return false;
        seenIds.add(user.id);
        return true;
      });
  };

  const getTeamName = (teamId?: string) => teams.find((team) => team.id === teamId)?.name ?? 'Unknown team';

  const checklistProgress = (checklist?: ChecklistItem[]) => {
    if (!checklist || checklist.length === 0) {
      return { total: 0, completed: 0 };
    }
    const completed = checklist.filter((entry) => entry.completed).length;
    return { total: checklist.length, completed };
  };

  const handleChecklistToggle = (itemId: string) => {
    setDetailChecklist((prev) =>
      prev.map((entry) => (entry.id === itemId ? { ...entry, completed: !entry.completed } : entry)),
    );
  };

  const handleChecklistAssign = (itemId: string, assigneeId: string) => {
    setDetailChecklist((prev) =>
      prev.map((entry) =>
        entry.id === itemId ? { ...entry, assigneeId: assigneeId || undefined } : entry,
      ),
    );
  };

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (start: string, end: string) => {
    updateFilter('dateFrom', start);
    updateFilter('dateTo', end);
  };

  useEffect(() => {
    if (!selectedWorkItem) {
      setDetailChecklist([]);
      setDetailActionItems([]);
      resetActionItemForm();
      setShowWorklogForm(false);
      return;
    }
    setDetailForm({
      title: selectedWorkItem.title,
      description: selectedWorkItem.description,
      status: selectedWorkItem.status,
      priority: selectedWorkItem.priority,
      ownerId: selectedWorkItem.ownerId ?? '',
      dueDate: selectedWorkItem.dueDate ?? '',
      department: selectedWorkItem.department ?? '',
      slaPolicyId: selectedWorkItem.slaPolicyId ?? '',
    });
    setDetailChecklist(selectedWorkItem.checklist ?? []);
    setDetailActionItems(selectedWorkItem.actionItems ?? []);
    resetWorklogForm();
    resetActionItemForm();
    resetChecklistForm();
    setShowActionForm(false);
    setShowChecklistForm(false);
  }, [selectedWorkItem]);

  useEffect(() => {
    if (viewMode === 'kanban' && selectedWorkItem) {
      window.setTimeout(() => {
        kanbanDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const columnEl = columnRefs.current[selectedWorkItem.status];
        columnEl?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }, 25);
    }
  }, [selectedWorkItem, viewMode]);

  const handleDetailChange = (field: keyof typeof detailForm, value: string) => {
    setDetailForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorklogField = (field: keyof typeof worklogForm, value: string) => {
    setWorklogForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetWorklogForm = () => {
    setWorklogForm({
      activityType: worklogActivities[0],
      hours: '1',
      date: new Date().toISOString().split('T')[0],
      description: '',
      userId: currentUserId,
    });
    setShowWorklogForm(false);
  };

  const resetActionItemForm = () => {
    setActionItemForm({ description: '', assigneeId: '' });
  };
  const handleCancelActionForm = () => {
    resetActionItemForm();
    setShowActionForm(false);
  };
  const resetChecklistForm = () => {
    setChecklistForm({ title: '', assigneeId: '' });
  };
  const handleCancelChecklistForm = () => {
    resetChecklistForm();
    setShowChecklistForm(false);
  };

  const handleActionItemField = (field: keyof typeof actionItemForm, value: string) => {
    setActionItemForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleActionItemSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkItem) return;
    const title = actionItemForm.description.trim();
    if (!title) return;
    setDetailActionItems((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, title, assigneeIds: actionItemForm.assigneeId ? [actionItemForm.assigneeId] : [] },
    ]);
    resetActionItemForm();
    setShowActionForm(false);
  };

  const handleChecklistFormField = (field: keyof typeof checklistForm, value: string) => {
    setChecklistForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChecklistAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const title = checklistForm.title.trim();
    if (!title) return;
    const newEntry: ChecklistItem = {
      id: `chk-${Date.now()}`,
      title,
      completed: false,
      assigneeId: checklistForm.assigneeId || undefined,
    };
    setDetailChecklist((prev) => [...prev, newEntry]);
    resetChecklistForm();
    setShowChecklistForm(false);
  };

  const handleWorklogSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkItem) return;
    const hours = parseFloat(worklogForm.hours);
    if (!Number.isFinite(hours) || hours <= 0) return;
    const minutes = Math.round(hours * 60);
    addWorklogEntry({
      workItemId: selectedWorkItem.id,
      userId: (worklogForm as any).userId || currentUserId,
      durationMinutes: minutes,
      notes: worklogForm.description,
      activityType: worklogForm.activityType,
      date: worklogForm.date,
    } as any);
    resetWorklogForm();
  };

  const handleDetailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedWorkItem) return;
    updateWorkItem(selectedWorkItem.id, {
      title: detailForm.title,
      description: detailForm.description,
      status: detailForm.status,
      priority: detailForm.priority,
      ownerId: detailForm.ownerId,
      dueDate: detailForm.dueDate || undefined,
      department: detailForm.department || undefined,
      slaPolicyId: detailForm.slaPolicyId || undefined,
      checklist: detailChecklist,
      actionItems: detailActionItems,
    });
    setSelectedWorkItem((prev) =>
      prev
        ? {
          ...prev,
          ...detailForm,
          dueDate: detailForm.dueDate || undefined,
          checklist: detailChecklist,
          actionItems: detailActionItems,
        }
        : prev,
    );
    setSelectedWorkItem(null);
  };

  const handleCancelEdit = () => {
    setSelectedWorkItem(null);
  };

  const viewButtonStyle = (mode: ViewMode) => ({
    backgroundColor: viewMode === mode ? designTokens.colors.accent : '#f8fafc',
    color: viewMode === mode ? '#ffffff' : '#0f172a',
    borderColor: viewMode === mode ? designTokens.colors.accent : '#d1d5db',
    boxShadow: viewMode === mode ? '0 10px 20px rgba(131, 0, 230, 0.25)' : undefined,
  });

  const handleFormSave = (item: WorkItem) => {
    addWorkItem(item);
    setShowForm(false);
  };

  const TABLE_COLUMNS = 7;

  const renderDetailSection = () => {
    if (!selectedWorkItem) return null;
    const detailTeamMembers = teamMembersFor(selectedWorkItem.teamId);
    const detailChecklistStats = checklistProgress(detailChecklist);
    const worklogList = getLogsForWorkItem(selectedWorkItem.id);
    const totalLoggedMinutes = worklogList.reduce((sum, log) => sum + log.durationMinutes, 0);
    const formatMinutes = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    const activityTotals = worklogList.reduce<Record<string, number>>((acc, log) => {
      const label = log.activityType || log.action || 'Work';
      acc[label] = (acc[label] ?? 0) + log.durationMinutes;
      return acc;
    }, {});
    const activityTotalsDisplay = Object.entries(activityTotals)
      .map(([activity, minutes]) => `${activity}: ${formatMinutes(minutes)}`)
      .join(' · ');
    const logOwnerName = (userId: string) => uniqueUsers.find((user) => user.id === userId)?.name ?? 'Unknown';
    const formatAssigneeNames = (ids: string[]) =>
      ids.length ? ids.map((id) => logOwnerName(id)).join(', ') : 'Unassigned';
    return (
      <section
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6"
        style={{ borderColor: designTokens.colors.accent }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Team</p>
            <p className="text-sm font-semibold text-slate-900">{getTeamName(selectedWorkItem.teamId)}</p>
            <p>{detailTeamMembers.map((member) => member.name).join(' · ') || 'No members assigned'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Status</p>
            <p className="text-sm font-semibold text-slate-900">{selectedWorkItem.status}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Priority</p>
            <p className="text-sm font-semibold text-slate-900">{selectedWorkItem.priority}</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleDetailSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={detailForm.title}
              onChange={(event) => handleDetailChange('title', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
              placeholder="Title"
            />
            <select
              value={detailForm.status}
              onChange={(event) => handleDetailChange('status', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            >
              {WORK_ITEM_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={detailForm.priority}
              onChange={(event) => handleDetailChange('priority', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            >
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <textarea
            value={detailForm.description}
            onChange={(event) => handleDetailChange('description', event.target.value)}
            className="!border !rounded-2xl !px-3 !py-2 !text-sm !w-full !min-h-[120px]"
            placeholder="Description"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={detailForm.ownerId}
              onChange={(event) => handleDetailChange('ownerId', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            >
              <option value="">Owner</option>
              {detailTeamMembers.length > 0 && (
                <optgroup label="Team members">
                  {detailTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="All users">
                {uniqueUsers
                  .filter((user) => !detailTeamMembers.some((member) => member.id === user.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
              </optgroup>
            </select>
            <input
              type="date"
              value={detailForm.dueDate}
              onChange={(event) => handleDetailChange('dueDate', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            />
            <select
              value={detailForm.department}
              onChange={(event) => handleDetailChange('department', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            >
              <option value="">Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <select
              value={detailForm.slaPolicyId}
              onChange={(event) => handleDetailChange('slaPolicyId', event.target.value)}
              className="!border !rounded-2xl !px-3 !py-2 !text-sm"
            >
              <option value="">SLA policy</option>
              {slaPolicies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <select
              value={selectedWorkItem.teamId}
              disabled
              className="!border !rounded-2xl !px-3 !py-2 !text-sm !bg-slate-50"
            >
              {teams
                .filter((team) => team.id === selectedWorkItem.teamId)
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !transition"
              style={{
                backgroundColor: designTokens.colors.accent,
                borderColor: designTokens.colors.accent,
                color: 'white',
              }}
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !border !border-slate-200 !text-slate-600"
            >
              Cancel
            </button>
            <p className="text-xs text-slate-500">
              Last modified {new Date(selectedWorkItem.modifiedAt).toLocaleString()}
            </p>
          </div>
        </form>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Work log</p>
                <p className="text-xs text-slate-500">{formatMinutes(totalLoggedMinutes)} total logged</p>
                <p className="text-xs text-slate-500">Estimated {selectedWorkItem.effortEstimate ?? 0}h · Consumed {formatMinutes(totalLoggedMinutes)}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">{activityTotalsDisplay || 'No activity logged'}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowWorklogForm(true);
                    setTimeout(() => worklogFormRef.current?.scrollIntoView({ behavior: 'smooth' }), 20);
                  }}
                  className="!px-3 !py-1 !text-xs !font-semibold !bg-slate-900 !text-white !rounded-full !flex !items-center !gap-2 !whitespace-nowrap"
                >
                  <PlusIcon />
                  Add work log
                </button>
              </div>
            </div>
            <div id="worklog-form-anchor" ref={worklogFormRef} />
            {showWorklogForm && (
              <form className="space-y-3" onSubmit={handleWorklogSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Activity type</span>
                    <select
                      value={worklogForm.activityType}
                      onChange={(event) => handleWorklogField('activityType', event.target.value)}
                      className="!border !rounded-2xl !px-3 !py-2 !text-sm !bg-white"
                    >
                      {worklogActivities.map((activity) => (
                        <option key={activity} value={activity}>
                          {activity}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Hours spent</span>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={worklogForm.hours}
                      onChange={(event) => handleWorklogField('hours', event.target.value)}
                      className="!border !rounded-2xl !px-3 !py-2 !text-sm !bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Date</span>
                    <input
                      type="date"
                      value={worklogForm.date}
                      onChange={(event) => handleWorklogField('date', event.target.value)}
                      className="!border !rounded-2xl !px-3 !py-2 !text-sm !bg-white"
                    />
                  </div>
                </div>
                <label className="text-xs text-slate-500 space-y-1">
                  Description
                  <textarea
                    value={worklogForm.description}
                    onChange={(event) => handleWorklogField('description', event.target.value)}
                    className="!border !rounded-2xl !px-3 !py-2 !text-sm !w-full !min-h-[80px]"
                    placeholder="Describe the work done..."
                  />
                </label>
                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !transition !bg-slate-900 !text-white"
                  >
                    Add log
                  </button>
                  <button
                    type="button"
                    onClick={resetWorklogForm}
                    className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !border !border-slate-200 !text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-sm text-slate-600">
            {worklogList.length === 0 ? (
              <p className="text-xs text-slate-400">No work logs yet.</p>
            ) : (
              worklogList.map((log) => (
                <div key={log.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {log.activityType || 'Work'} · {formatMinutes(log.durationMinutes)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {logOwnerName(log.userId)} · {new Date(log.timestamp).toLocaleDateString()} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{log.notes || '—'}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Action items</p>
            <button
              type="button"
              onClick={() => setShowActionForm(true)}
              className="!px-3 !py-1 !rounded-full !text-xs !font-semibold !shadow !bg-slate-900 !text-white !flex !items-center !gap-2 !whitespace-nowrap"
            >
              <PlusIcon />
              Add action item
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-sm text-slate-600">
            {detailActionItems.length === 0 ? (
              <p className="text-xs text-slate-400">No action items yet.</p>
            ) : (
              detailActionItems.map((item) => (
                <div key={item.id} className="space-y-1 border-b last:border-b-0 pb-3">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">Assigned to {formatAssigneeNames(item.assigneeIds)}</p>
                </div>
              ))
            )}
          </div>
          {showActionForm && (
            <form className="space-y-3" onSubmit={handleActionItemSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={actionItemForm.description}
                  onChange={(event) => handleActionItemField('description', event.target.value)}
                  className="!border !rounded-2xl !px-3 !py-2 !text-sm"
                  placeholder="Action item description"
                />
                <label className="text-xs text-slate-500 space-y-1">
                  Action item member
                  <select
                    value={actionItemForm.assigneeId}
                    onChange={(event) => handleActionItemField('assigneeId', event.target.value)}
                    className="!border !rounded-2xl !px-3 !py-2 !text-sm"
                  >
                    <option value="">Select team member</option>
                    <optgroup label="All Users">
                      {uniqueUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !transition !flex !items-center !gap-2 !whitespace-nowrap"
                  style={{
                    backgroundColor: designTokens.colors.accent,
                    borderColor: designTokens.colors.accent,
                    color: 'white',
                  }}
                >
                  <PlusIcon />
                  Add new action item
                </button>
                <button
                  type="button"
                  onClick={handleCancelActionForm}
                  className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !border !border-slate-200 !text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Checklist</p>
            <p className="text-xs text-slate-500">
              {detailChecklistStats.total
                ? `${detailChecklistStats.completed}/${detailChecklistStats.total} complete`
                : 'No checklist items'}
            </p>
            <button
              type="button"
              onClick={() => setShowChecklistForm(true)}
              className="!px-3 !py-1 !rounded-full !text-xs !font-semibold !shadow !bg-slate-900 !text-white !flex !items-center !gap-2 !whitespace-nowrap"
            >
              <PlusIcon />
              Add checklist item
            </button>
          </div>
          <div className="grid gap-2">
            {detailChecklist.length === 0 ? (
              <p className="text-xs text-slate-400">No checklist items defined for this work item yet.</p>
            ) : (
              detailChecklist.map((entry) => (
                <label
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={entry.completed}
                      onChange={() => handleChecklistToggle(entry.id)}
                      className="!h-4 !w-4 !rounded !border-slate-300 !text-slate-700 !accent-teal-500"
                    />
                    <span className="font-semibold text-slate-700">{entry.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={entry.assigneeId ?? ''}
                      onChange={(event) => handleChecklistAssign(entry.id, event.target.value)}
                      className="!border !rounded-full !px-2 !py-1 !text-[11px] !text-slate-600"
                    >
                      <option value="">Unassigned</option>
                      {uniqueUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${entry.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {entry.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </label>
              ))
            )}
          </div>
          {showChecklistForm && (
            <form className="space-y-3" onSubmit={handleChecklistAdd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={checklistForm.title}
                  onChange={(event) => handleChecklistFormField('title', event.target.value)}
                  className="!border !rounded-2xl !px-3 !py-2 !text-sm"
                  placeholder="New checklist item"
                />
                <select
                  value={checklistForm.assigneeId}
                  onChange={(event) => handleChecklistFormField('assigneeId', event.target.value)}
                  className="!border !rounded-2xl !px-3 !py-2 !text-sm"
                >
                  <option value="">Assign to</option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !transition !flex !items-center !gap-2 !whitespace-nowrap"
                  style={{
                    backgroundColor: designTokens.colors.accent,
                    borderColor: designTokens.colors.accent,
                    color: 'white',
                  }}
                >
                  <PlusIcon />
                  Add new checklist item
                </button>
                <button
                  type="button"
                  onClick={handleCancelChecklistForm}
                  className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !border !border-slate-200 !text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

    );
  };

  return (
    <div className="space-y-6">
      <header className="space-y-6">
        <div className="space-y-3 max-w-3xl">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Work Items</p>
          <h1 className="text-3xl font-semibold text-slate-900">Developer & Support Command Center</h1>
          <p className="text-sm text-slate-500">
            Manage development and support workloads in one command center.
          </p>
          <p className="text-sm text-slate-500">
            Track SLAs, request status, and resolution timelines while collaborating across teams.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !transition"
            onClick={() => setShowForm((prev) => !prev)}
            style={{
              backgroundColor: designTokens.colors.accent,
              borderColor: designTokens.colors.accent,
              color: 'white',
            }}
          >
            {showForm ? 'Hide entry' : '+ New work item'}
          </button>
        </div>
      </header>

      {showForm && (
        <section className="bg-slate-100/50 rounded-3xl border border-slate-200 p-6 shadow-sm">
          <WorkItemForm
            teams={teams}
            users={users}
            slaPolicies={slaPolicies}
            departments={departments}
            onSave={handleFormSave}
          />
        </section>
      )}

      <section className="flex flex-wrap gap-4">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} className="px-4 py-2 rounded-2xl bg-white shadow border border-slate-100 text-sm font-semibold">
            {type} · {count}
          </div>
        ))}
      </section>

      <section className="bg-white rounded-2xl shadow border border-slate-100 p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 flex-1 min-w-[320px]">
            <select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} className="border rounded-2xl px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="InternalDev">Internal Dev</option>
              <option value="CustomerSupport">Customer Support</option>
              <option value="Feature">Feature</option>
              <option value="ChangeRequest">Change Request</option>
              <option value="Release">Release</option>
              <option value="AITools">AI Tools</option>
            </select>
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="border rounded-2xl px-3 py-2 text-sm">
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Triaged">Triaged</option>
              <option value="InProgress">In Progress</option>
              <option value="QA">QA</option>
              <option value="UAT">UAT</option>
              <option value="Delivered">Delivered</option>
            </select>
            <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)} className="border rounded-2xl px-3 py-2 text-sm">
              <option value="">All Priorities</option>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>

            <DateRangeSelector
              startDate={filters.dateFrom || undefined}
              endDate={filters.dateTo || undefined}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search..."
              className="border rounded-2xl px-3 py-2 text-sm w-44"
            />
            <button
              type="button"
              aria-label="Table view"
              className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !border"
              onClick={() => setViewMode('table')}
              style={viewButtonStyle('table')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 5h6v6H4V5zm8 0h6v6h-6V5zm-8 8h6v6H4v-6zm8 0h6v6h-6v-6z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Kanban view"
              className="!px-4 !py-2 !rounded-full !text-sm !font-semibold !shadow !border"
              onClick={() => setViewMode('kanban')}
              style={viewButtonStyle('kanban')}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5h4v14H3V5zm6 0h4v7H9V5zm6 0h4v11h-4V5z" />
              </svg>
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-soft-slate text-slate-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">SLA</th>
                    <th className="px-4 py-3 text-left">Due</th>
                    <th className="px-4 py-3 text-left">Logged</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTableItems.map((item) => {
                    const summary = computeSlaSummary(item);
                    return (
                      <React.Fragment key={item.id}>
                        <tr className="border-b last:border-0">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.id}</td>
                          <td className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500">{item.workItemType}</td>
                          <td className="px-4 py-3 text-slate-600">{item.title}</td>
                          <td className="px-4 py-3 text-slate-600">{item.status}</td>
                          <td className="px-4 py-3 text-slate-600">{item.priority}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${summary.slaState === 'Breached'
                                ? 'bg-rose-100 text-rose-700'
                                : summary.slaState === 'AtRisk'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                                }`}
                            >
                              {summary.slaState}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBD'}</td>
                          <td className="px-4 py-3 text-slate-600 text-center">{formatMinutes(totalLoggedMinutesFor(item.id))}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedWorkItem(item)}
                              className="flex items-center justify-center px-3 py-1 rounded-full border text-xs font-semibold text-slate-600 border-slate-200 bg-white"
                              aria-label="Open edit panel"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 17.25V20h2.75l8.34-8.34-2.75-2.75L4 17.25zm15.02-10.02a.996.996 0 0 0 0-1.41l-2.84-2.84a.996.996 0 0 0-1.41 0l-1.83 1.83 4.24 4.24 1.84-1.82z" />
                              </svg>
                              <span className="sr-only">Edit work item</span>
                            </button>
                          </td>
                        </tr>
                        {viewMode === 'table' && selectedWorkItem?.id === item.id && (
                          <tr>
                            <td colSpan={TABLE_COLUMNS} className="p-0 bg-slate-50">
                              {renderDetailSection()}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {visibleTableItems.length < filteredTableItems.length && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  onClick={() => setWorkPage((prev) => prev + 1)}
                >
                  Load more work items
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="overflow-x-auto" ref={kanbanBoardRef}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-full">
              {WORK_ITEM_STATUSES.map((status) => (
                <div
                  key={status}
                  ref={(el) => {
                    columnRefs.current[status] = el;
                  }}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-4 space-y-3 min-h-[220px]"
                >
                  <h4 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">{status}</h4>
                  {filteredWorkItems
                    .filter((item) => item.status === status)
                    .map((item) => {
                      const dueDateLabel = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'TBD';
                      const isSelected = selectedWorkItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl bg-white border p-3 shadow-sm transition hover:shadow-md ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
                            }`}
                          onClick={() => {
                            setSelectedWorkItem(item);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-500">Due {dueDateLabel}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                            <span className="font-semibold text-slate-700">{item.priority}</span>
                            <span>{item.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  {viewMode === 'kanban' && selectedWorkItem?.status === status && (
                    <div className="mt-4" ref={kanbanDetailRef}>
                      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm">
                        {renderDetailSection()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedWorkItem && viewMode !== 'table' && renderDetailSection()}

    </div>
  );
};

export default WorkItems;

