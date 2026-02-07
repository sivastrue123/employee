import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import {
  Attachment,
  AuditEntry,
  Environment,
  NotificationRule,
  Note,
  SlaEvent,
  SlaPolicy,
  SlaState,
  Team,
  TimelinePlan,
  User,
  WorkItem,
  WorkItemPriority,
  WorkItemStatus,
  WorkItemType,
} from '../types';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../lib/axios';

const statusToStage: Record<WorkItemStatus, string> = {
  New: 'Triage',
  Triaged: 'Response',
  InProgress: 'Execution',
  Blocked: 'Execution',
  QA: 'QA',
  UAT: 'UAT',
  Delivered: 'Delivery',
  Closed: 'Delivery',
  Rejected: 'Resolution',
  OnHold: 'Execution',
};

export interface FilterState {
  type: WorkItemType | '';
  customer: string | '';
  teamId: string | '';
  ownerId: string | '';
  priority: WorkItemPriority | '';
  status: WorkItemStatus | '';
  slaState: SlaState | '';
  dateFrom: string | '';
  dateTo: string | '';
}

interface AppContextValue {
  workItems: WorkItem[];
  filteredWorkItems: WorkItem[];
  notes: Note[];
  slaPolicies: SlaPolicy[];
  notificationRules: NotificationRule[];
  timelinePlans: TimelinePlan[];
  teams: Team[];
  users: User[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  addWorkItem: (item: WorkItem) => void;
  updateWorkItem: (id: string, patch: Partial<WorkItem>) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  addTeam: (entry: { name: string; department: string; keyskills: string; isActive: boolean }) => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  addSlaPolicy: (entry: { name: string; appliesTo: string; slaTime: string }) => void;
  updateSlaPolicy: (id: string, patch: { name: string; appliesTo: string; slaTime: string }) => void;
  computeSlaSummary: (workItem: WorkItem) => {
    stageName: string;
    remainingHours: number | null;
    slaState: SlaState;
  };
  toggleNotificationRule: (id: string, active: boolean) => void;
  askAgent: (question: string, userId: string) => AgentResponse;
  worklogs: Worklog[];
  currentUserId: string;
  activeLogId: string | null;
  activeWorkItemId: string | null;
  startWorklog: (workItemId: string) => void;
  stopWorklog: () => void;
  addWorklogEntry: (entry: Omit<Worklog, 'id' | 'timestamp'> & { date?: string }) => void;
  updateWorklogEntry: (
    id: string,
    patch: Partial<Omit<Worklog, 'id'>> & { date?: string },
  ) => void;
  getLogsForWorkItem: (workItemId: string) => Worklog[];
  totalLoggedMinutesFor: (workItemId: string) => number;
  departments: string[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialTeams: Team[] = [];

const departmentMaster = ['Platform', 'Customer Experience', 'Product Strategy', 'Quality', 'Support'];

const VALID_WORK_ITEM_TYPES: WorkItemType[] = [
  'InternalDev',
  'CustomerSupport',
  'Feature',
  'ChangeRequest',
  'Release',
  'AITools',
  'MeetingAction',
  'DiscussionAction',
];

const parseAppliesToList = (input: string): WorkItemType[] =>
  input
    .split(',')
    .map((candidate) => candidate.trim())
    .filter((candidate): candidate is WorkItemType => VALID_WORK_ITEM_TYPES.includes(candidate as WorkItemType));

const resolveBaseHours = (input?: string) => Math.max(Math.round(Number(input) || 8), 1);

const buildStageDurations = (baseHours: number) => ({
  Triage: baseHours,
  Response: baseHours * 2,
  Execution: baseHours * 6,
  QA: Math.max(baseHours, 4),
  UAT: Math.max(baseHours, 4),
  Delivery: Math.max(baseHours, 2),
  Resolution: Math.max(baseHours, 4),
});

const initialUsers: User[] = [];

const initialSlaPolicies: SlaPolicy[] = [];

const attachments: Attachment[] = [
  { id: 'att-1', label: 'CI/CD pipeline notes', type: 'file', url: '#', uploadedBy: 'u2' },
  { id: 'att-2', label: 'Customer call audio', type: 'file', url: '#', uploadedBy: 'u3' },
];

const slaEvents: SlaEvent[] = [
  {
    id: 'sla-1',
    workItemId: 'DEV-010',
    stageName: 'Execution',
    stageStart: '2026-01-18T08:00:00Z',
    stageEnd: '2026-01-21T12:00:00Z',
    stageDurationHours: 76,
    slaStatus: 'WithinSLA',
  },
  {
    id: 'sla-2',
    workItemId: 'SUP-001',
    stageName: 'Resolution',
    stageStart: '2026-01-19T06:00:00Z',
    stageEnd: '2026-01-20T06:00:00Z',
    stageDurationHours: 24,
    slaStatus: 'Breached',
  },
];

const auditLog: AuditEntry[] = [
  { id: 'audit-1', action: 'Created', actorId: 'u1', detail: 'WorkItem created via Roadmap import', timestamp: '2026-01-15T10:00:00Z' },
  { id: 'audit-2', action: 'Status updated', actorId: 'u2', detail: 'Moved to InProgress', timestamp: '2026-01-18T08:00:00Z' },
];

const initialWorkItems: WorkItem[] = [];

type AgentSourceType = 'work_item' | 'note' | 'worklog' | 'user';

interface Worklog {
  id: string;
  workItemId: string;
  userId: string;
  action: 'start' | 'pause' | 'resume' | 'end' | 'log';
  timestamp: string;
  durationMinutes: number;
  notes: string;
  activityType?: string;
}

const initialWorklogs: Worklog[] = [];

interface AgentSource {
  id: string;
  type: AgentSourceType;
  title: string;
  summary: string;
  timestamp: string;
  meta: Record<string, string>;
}

interface AgentResponse {
  answer: string;
  sources: AgentSource[];
}

const minutesBetween = (start: string, end: string) =>
  Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));

const initialNotes: Note[] = [];

const initialNotificationRules: NotificationRule[] = [];

const initialTimelinePlans: TimelinePlan[] = [];

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [worklogs, setWorklogs] = useState<Worklog[]>([]);
  const [teamList, setTeamList] = useState<Team[]>(initialTeams);
  const [slaPolicyList, setSlaPolicyList] = useState<SlaPolicy[]>([]);
  const [departments, setDepartments] = useState<string[]>(departmentMaster);
  const [userList, setUserList] = useState<User[]>(initialUsers);

  // Integration with Main App Auth
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser?.userId) {
      setUserList((prev) => {
        if (prev.some((u) => u.id === authUser.userId)) return prev;
        return [
          ...prev,
          {
            id: authUser.userId,
            name: authUser.name || 'Authenticated User',
            role: (authUser.role as any) || 'Agent',
            teamId: 'eng', // Default assignment
          },
        ];
      });
    }
  }, [authUser, userList.length]);

  const currentUserId = authUser?.userId || 'u3';
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [activeWorkItemId, setActiveWorkItemId] = useState<string | null>(null);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [timelinePlans, setTimelinePlans] = useState<TimelinePlan[]>([]);

  // Fetch Data from API
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [itemsRes, notesRes, configsRes, logsRes, usersRes] = await Promise.all([
          api.get('/api/task-app/items'),
          api.get('/api/task-app/notes'),
          api.get('/api/task-app/configs'),
          api.get('/api/task-app/worklogs'),
          api.get('/api/employee/getAllEmployee')
        ]);

        setWorkItems(itemsRes.data || []);
        setNotes(notesRes.data || []);
        if (configsRes.data) {
          const policies = configsRes.data.slaPolicies || [];
          // Fallback if no policies exist in DB
          if (policies.length === 0) {
            policies.push({
              id: 'default',
              name: 'Default SLA',
              appliesTo: ['InternalDev', 'CustomerSupport', 'Feature', 'ChangeRequest', 'Release', 'AITools', 'MeetingAction', 'DiscussionAction'],
              stageDurations: { Triage: 4, Response: 8, Execution: 72, QA: 24, UAT: 24, Delivery: 12, Resolution: 36 },
              businessHours: true,
              breachThresholdPct: 0.2,
              reminderWindowHours: 24,
              holidays: [],
            });
          }
          setSlaPolicyList(policies);
          setNotificationRules(configsRes.data.rules || []);
          setTimelinePlans(configsRes.data.plans || []);
        }
        setWorklogs(logsRes.data || []);

        if (usersRes.data && Array.isArray(usersRes.data)) {
          const activeUsers = usersRes.data.filter((emp: any) => emp.status && emp.status.toLowerCase() === 'active');
          const mappedUsers: User[] = activeUsers.map((emp: any) => ({
            id: emp.employee_id,
            name: `${emp.first_name} ${emp.last_name}`,
            role: emp.role === 'admin' ? 'Admin' : 'Agent',
            teamId: 'eng',
            avatar: emp.profile_image
          }));
          setUserList(mappedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch Task App data:", error);
      }
    };
    fetchAllData();
  }, []);

  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setMonth(defaultFrom.getMonth() - 3);
  const defaultTo = new Date(today);
  defaultTo.setMonth(defaultTo.getMonth() + 3);
  const formatDate = (input: Date) => input.toISOString().split('T')[0];

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    customer: '',
    teamId: '',
    ownerId: '',
    priority: '',
    status: '',
    slaState: '',
    dateFrom: formatDate(defaultFrom),
    dateTo: formatDate(defaultTo),
  });

  const ensureDepartment = (department?: string) => {
    const normalized = department?.trim();
    if (!normalized) return;
    setDepartments((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const createTeamMember = (name: string, teamId: string) => {
    const memberId = `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newMember: User = {
      id: memberId,
      name: name || 'Team member',
      role: 'Agent',
      teamId,
    };
    setUserList((prev) => [...prev, newMember]);
    return memberId;
  };

  const computeSlaSummary = (workItem: WorkItem) => {
    const policy = slaPolicyList.find((p) => p.id === workItem.slaPolicyId) ?? slaPolicyList[0];
    const stageName = statusToStage[workItem.status] ?? 'Execution';
    if (!workItem.dueDate) {
      return { stageName, remainingHours: null, slaState: 'WithinSLA' as SlaState };
    }

    const due = new Date(workItem.dueDate).getTime();
    const now = Date.now();
    const remainingHours = Math.round((due - now) / (1000 * 60 * 60));
    const stageWindow = policy.stageDurations[stageName] ?? 24;
    const threshold = Math.max(1, Math.floor(stageWindow * policy.breachThresholdPct));

    let slaState: SlaState = 'WithinSLA';
    if (remainingHours < 0) {
      slaState = 'Breached';
    } else if (remainingHours <= threshold) {
      slaState = 'AtRisk';
    }

    return {
      stageName,
      remainingHours,
      slaState,
    };
  };

  const filteredWorkItems = useMemo(() => {
    return workItems.filter((item) => {
      if (filters.type && item.workItemType !== filters.type) return false;
      if (filters.customer && item.customer?.toLowerCase() !== filters.customer.toLowerCase()) return false;
      if (filters.teamId && item.teamId !== filters.teamId) return false;
      if (filters.ownerId && item.ownerId !== filters.ownerId) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.slaState && item.slaState !== filters.slaState) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        const due = item.dueDate ? new Date(item.dueDate) : null;
        if (!due || due < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        const due = item.dueDate ? new Date(item.dueDate) : null;
        if (!due || due > to) return false;
      }
      return true;
    });
  }, [filters, workItems]);

  const addWorkItem = async (item: WorkItem) => {
    try {
      const { id, ...payload } = item;
      const { data: newItem } = await api.post('/api/task-app/items', payload);
      setWorkItems((prev) => [newItem, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateWorkItem = async (id: string, patch: Partial<WorkItem>) => {
    try {
      setWorkItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch, modifiedAt: new Date().toISOString() } : item)),
      );
      await api.put(`/api/task-app/items/${id}`, patch);
    } catch (e) { console.error(e); }
  };

  const addNote = async (note: Note) => {
    try {
      const { id, ...payload } = note;
      const { data: newNote } = await api.post('/api/task-app/notes', payload);
      setNotes((prev) => [newNote, ...prev]);
    } catch (e) { console.error(e); }
  };

  const updateNote = async (id: string, patch: Partial<Note>) => {
    try {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, ...patch } : note)),
      );
      await api.put(`/api/task-app/notes/${id}`, patch);
    } catch (e) { console.error(e); }
  };

  const addTeam = (entry: { name: string; department: string; keyskills: string; isActive: boolean; leadId?: string; members?: string[] }) => {
    const department = entry.department.trim();
    const code = department
      ? department.replace(/\s+/g, '').slice(0, 4).toUpperCase()
      : 'GEN';
    const teamName = entry.name.trim() || `Team ${code}`;
    ensureDepartment(department);

    setTeamList((prev) => {
      const normalizedName = teamName.trim().toLowerCase();
      if (normalizedName && prev.some((team) => team.name.trim().toLowerCase() === normalizedName)) {
        return prev;
      }
      const teamId = `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Use provided leadId or members, fall back to empty if not provided (avoiding dummy user creation)
      const leadName = userList.find(u => u.id === entry.leadId)?.name || 'Unassigned';

      const newTeam: Team = {
        id: teamId,
        name: teamName,
        code,
        lead: leadName,
        members: entry.members || (entry.leadId ? [entry.leadId] : []),
        department: department || undefined,
        keyskills: entry.keyskills,
        isActive: entry.isActive,
      };
      return [...prev, newTeam];
    });
  };

  const updateTeam = (id: string, patch: Partial<Team>) => {
    setTeamList((prev) =>
      prev.map((team) => {
        if (team.id !== id) return team;
        ensureDepartment(patch.department ?? team.department);
        return { ...team, ...patch };
      }),
    );
  };

  const addSlaPolicy = (entry: { name: string; appliesTo: string; slaTime: string }) => {
    const appliesList = parseAppliesToList(entry.appliesTo);
    const baseHours = resolveBaseHours(entry.slaTime);
    const newPolicy: SlaPolicy = {
      id: `policy-${Date.now()}`,
      name: entry.name || 'New SLA Policy',
      appliesTo: appliesList.length ? appliesList : initialSlaPolicies[0].appliesTo,
      stageDurations: buildStageDurations(baseHours),
      businessHours: true,
      breachThresholdPct: 0.2,
      reminderWindowHours: 24,
      holidays: [],
    };
    setSlaPolicyList((prev) => [...prev, newPolicy]);
  };

  const updateSlaPolicy = (id: string, entry: { name: string; appliesTo: string; slaTime: string }) => {
    const appliesList = parseAppliesToList(entry.appliesTo);
    const baseHours = resolveBaseHours(entry.slaTime);
    setSlaPolicyList((prev) =>
      prev.map((policy) =>
        policy.id === id
          ? {
            ...policy,
            name: entry.name || policy.name,
            appliesTo: appliesList.length ? appliesList : policy.appliesTo,
            stageDurations: buildStageDurations(baseHours),
          }
          : policy,
      ),
    );
  };

  const toggleNotificationRule = (id: string, active: boolean) => {
    setNotificationRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, active } : rule)));
  };

  const getLogsForWorkItem = (workItemId: string) => worklogs.filter((log) => log.workItemId === workItemId);

  const totalLoggedMinutesFor = (workItemId: string) =>
    getLogsForWorkItem(workItemId).reduce((sum, log) => sum + log.durationMinutes, 0);

  const askAgent = (question: string, userId: string): AgentResponse => {
    const normalized = question.trim().toLowerCase();
    if (!normalized) {
      return { answer: 'Please ask about a work item, note, user, or worklog.', sources: [] };
    }
    const tokens = normalized.split(/\W+/).filter(Boolean);
    const matches: AgentSource[] = [];

    workItems.forEach((item) => {
      const haystack = [item.id, item.title, item.description, item.status, item.priority, item.ownerId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (tokens.some((token) => haystack.includes(token))) {
        matches.push({
          id: item.id,
          type: 'work_item',
          title: item.title,
          summary: `Status ${item.status}, Priority ${item.priority}`,
          timestamp: item.modifiedAt,
          meta: {
            owner: item.ownerId ?? 'unassigned',
            due: item.dueDate ?? 'N/A',
          },
        });
      }
    });

    notes.forEach((note) => {
      const haystack = [note.title, note.summary, ...note.decisions].join(' ').toLowerCase();
      if (tokens.some((token) => haystack.includes(token))) {
        matches.push({
          id: note.id,
          type: 'note',
          title: note.title,
          summary: note.summary,
          timestamp: note.dateTime,
          meta: { type: note.type },
        });
      }
    });

    worklogs.forEach((log) => {
      const haystack = log.notes.toLowerCase();
      if (tokens.some((token) => haystack.includes(token))) {
        matches.push({
          id: log.id,
          type: 'worklog',
          title: `Worklog for ${log.workItemId}`,
          summary: `${log.durationMinutes}m · ${log.action}`,
          timestamp: log.timestamp,
          meta: { user: log.userId },
        });
      }
    });

    userList.forEach((user) => {
      const haystack = [user.name, user.role, user.teamId].join(' ').toLowerCase();
      if (tokens.some((token) => haystack.includes(token))) {
        matches.push({
          id: user.id,
          type: 'user',
          title: user.name,
          summary: `Role ${user.role}`,
          timestamp: new Date().toISOString(),
          meta: { team: user.teamId },
        });
      }
    });

    const answer = matches.length
      ? `Found ${matches.length} related entries. Highlighted source: ${matches[0].title}.`
      : "I couldn't find results—try another keyword.";
    return { answer, sources: matches.slice(0, 4) };
  };

  const startWorklog = (workItemId: string) => {
    if (activeLogId) {
      stopWorklog();
    }
    const now = new Date().toISOString();
    const entry: Worklog = {
      id: `wl-${Date.now()}`,
      workItemId,
      userId: currentUserId,
      action: 'start',
      timestamp: now,
      durationMinutes: 0,
      notes: 'Work session started',
    };
    setWorklogs((prev) => [...prev, entry]);
    setActiveLogId(entry.id);
    setActiveWorkItemId(workItemId);
  };

  const stopWorklog = () => {
    if (!activeLogId) return;
    const now = new Date().toISOString();
    setWorklogs((prev) =>
      prev.map((log) =>
        log.id === activeLogId
          ? { ...log, end: now, durationMinutes: minutesBetween(log.timestamp, now) }
          : log,
      ),
    );
    setActiveLogId(null);
    setActiveWorkItemId(null);
  };

  const addWorklogEntry = (entry: Omit<Worklog, 'id' | 'timestamp'> & { date?: string }) => {
    const timestamp = entry.date ? new Date(entry.date).toISOString() : new Date().toISOString();
    const worklog: Worklog = {
      id: `wl-${Date.now()}`,
      workItemId: entry.workItemId,
      userId: entry.userId,
      action: 'log',
      timestamp,
      durationMinutes: entry.durationMinutes,
      notes: entry.notes,
      activityType: entry.activityType ?? 'Work',
    };
    setWorklogs((prev) => [...prev, worklog]);
  };

  const updateWorklogEntry = (
    id: string,
    patch: Partial<Omit<Worklog, 'id'>> & { date?: string },
  ) => {
    setWorklogs((prev) =>
      prev.map((log) =>
        log.id === id
          ? {
            ...log,
            ...patch,
            timestamp: patch.date ? new Date(patch.date).toISOString() : log.timestamp,
          }
          : log,
      ),
    );
  };

  return (
    <AppContext.Provider
      value={{
        workItems,
        filteredWorkItems,
        notes,
        slaPolicies: slaPolicyList,
        notificationRules,
        timelinePlans,
        teams: teamList,
        departments,
        users: userList,
        filters,
        setFilters,
        addWorkItem,
        updateWorkItem,
        addNote,
        updateNote,
        addTeam,
        updateTeam,
        addSlaPolicy,
        updateSlaPolicy,
        computeSlaSummary,
        toggleNotificationRule,
        askAgent,
        worklogs,
        currentUserId,
        activeLogId,
        activeWorkItemId,
        startWorklog,
        stopWorklog,
        addWorklogEntry,
        updateWorklogEntry,
        getLogsForWorkItem,
        totalLoggedMinutesFor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

