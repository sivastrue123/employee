import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
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

const initialTeams: Team[] = [
  {
    id: 'eng',
    name: 'Engineering',
    code: 'ENG',
    lead: 'S. Rao',
    members: ['u1', 'u2', 'u4'],
    department: 'Platform',
    keyskills: 'Backend, Infra',
    isActive: true,
  },
  {
    id: 'support',
    name: 'Support',
    code: 'SUP',
    lead: 'L. Alvarez',
    members: ['u3', 'u5'],
    department: 'Customer Experience',
    keyskills: 'Troubleshooting, Voice',
    isActive: true,
  },
  {
    id: 'product',
    name: 'Product',
    code: 'PRD',
    lead: 'K. James',
    members: ['u6'],
    department: 'Product Strategy',
    keyskills: 'Strategy, Research',
    isActive: true,
  },
  {
    id: 'qa',
    name: 'Quality',
    code: 'QA',
    lead: 'R. Beck',
    members: ['u7'],
    department: 'Quality',
    keyskills: 'Test Automation',
    isActive: true,
  },
];

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

const initialUsers: User[] = [
  { id: 'u1', name: 'Gomathi Arunraj', role: 'Admin', teamId: 'eng' },
  { id: 'u2', name: 'Sarah Johnson', role: 'Manager', teamId: 'eng' },
  { id: 'u3', name: 'Mike Chen', role: 'Agent', teamId: 'support' },
  { id: 'u4', name: 'Leah Patel', role: 'Agent', teamId: 'eng' },
  { id: 'u5', name: 'Tom Kim', role: 'Agent', teamId: 'support' },
  { id: 'u6', name: 'Priya Nair', role: 'Manager', teamId: 'product' },
  { id: 'u7', name: 'Deepa Reddy', role: 'Agent', teamId: 'qa' },
];

const initialSlaPolicies: SlaPolicy[] = [
  {
    id: 'default',
    name: 'Default SLA',
    appliesTo: ['InternalDev', 'CustomerSupport', 'Feature', 'ChangeRequest', 'Release', 'AITools', 'MeetingAction', 'DiscussionAction'],
    stageDurations: {
      Triage: 4,
      Response: 8,
      Execution: 72,
      QA: 24,
      UAT: 24,
      Delivery: 12,
      Resolution: 36,
    },
    businessHours: true,
    breachThresholdPct: 0.2,
    reminderWindowHours: 24,
    holidays: ['2026-01-25', '2026-02-14'],
  },
];

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

const initialWorkItems: WorkItem[] = [
  {
    id: 'DEV-010',
    workItemType: 'InternalDev',
    title: 'Implement automated testing pipeline',
    description: 'Set up CI/CD with automated unit and integration tests for all services.',
    customer: 'Internal',
    project: 'Platform Core',
    module: 'DevOps',
    priority: 'P2',
    status: 'Closed',
    slaPolicyId: 'default',
    teamId: 'eng',
    department: 'Platform',
    ownerId: 'u2',
    approverId: 'u1',
    plannedStart: '2026-01-10T08:00:00Z',
    dueDate: '2026-02-10T18:00:00Z',
    actualStart: '2026-01-12T09:00:00Z',
    actualEnd: '2026-02-05T16:00:00Z',
    effortEstimate: 40,
    effortSpent: 35,
    tags: ['ci', 'automation'],
    components: ['backend', 'infra'],
    environment: 'Prod',
    dependencies: ['FEA-002'],
    attachments,
    actionItems: [],
    checklist: [
      { id: 'DEV-010-chk-1', title: 'Design pipeline architecture', completed: true, assigneeId: 'u2' },
      { id: 'DEV-010-chk-2', title: 'Instrument integration tests', completed: false, assigneeId: 'u4' },
      { id: 'DEV-010-chk-3', title: 'Validate flaky suites', completed: false, assigneeId: 'u4' },
    ],
    comments: [
      { id: 'c1', authorId: 'u4', content: 'Verified pipeline fails on flaky tests.', createdAt: '2026-01-20T11:00:00Z' },
    ],
    slaEvents,
    slaState: 'WithinSLA',
    auditLog,
    createdBy: 'u1',
    createdAt: '2026-01-15T10:00:00Z',
    modifiedBy: 'u2',
    modifiedAt: '2026-01-21T12:00:00Z',
  },
  {
    id: 'SUP-001',
    workItemType: 'CustomerSupport',
    title: 'Login authentication failing for SSO users',
    description: 'Investigate and resolve multi-factor token refresh causing 401 responses.',
    customer: 'Acme Corporation',
    project: 'Support',
    module: 'SSO',
    priority: 'P0',
    status: 'InProgress',
    slaPolicyId: 'default',
    teamId: 'support',
    department: 'Customer Experience',
    ownerId: 'u3',
    approverId: 'u5',
    plannedStart: '2026-01-19T06:00:00Z',
    dueDate: '2026-01-25T18:00:00Z',
    actualStart: '2026-01-19T06:30:00Z',
    actualEnd: undefined,
    effortEstimate: 16,
    effortSpent: 8,
    tags: ['sso', 'security'],
    components: ['auth-api'],
    environment: 'Prod',
    dependencies: [],
    attachments: [],
    actionItems: [],
    checklist: [
      { id: 'SUP-001-chk-1', title: 'Capture IdP logs', completed: true, assigneeId: 'u3' },
      { id: 'SUP-001-chk-2', title: 'Validate retry flow', completed: false, assigneeId: 'u5' },
    ],
    comments: [{ id: 'c2', authorId: 'u3', content: 'Reached out to IdP for logs.', createdAt: '2026-01-21T13:20:00Z' }],
    slaEvents: [],
    slaState: 'AtRisk',
    auditLog: [
      { id: 'audit-3', action: 'Assigned', actorId: 'u3', detail: 'Assigned to Mike Chen', timestamp: '2026-01-19T06:00:00Z' },
    ],
    createdBy: 'u5',
    createdAt: '2026-01-18T16:30:00Z',
    modifiedBy: 'u3',
    modifiedAt: '2026-01-21T13:20:00Z',
  },
  {
    id: 'FEA-002',
    workItemType: 'Feature',
    title: 'Implement dashboard analytics export',
    description: 'Enable CSV/PDF export for delivery analytics and SLA compliance charts.',
    customer: 'Global Services Ltd',
    project: 'Analytics',
    module: 'Exports',
    priority: 'P2',
    status: 'QA',
    slaPolicyId: 'default',
    teamId: 'eng',
    department: 'Product Strategy',
    ownerId: 'u1',
    approverId: 'u6',
    plannedStart: '2026-01-15T08:00:00Z',
    dueDate: '2026-02-01T18:00:00Z',
    actualStart: '2026-01-16T09:15:00Z',
    actualEnd: undefined,
    effortEstimate: 24,
    effortSpent: 18,
    tags: ['analytics', 'export'],
    components: ['frontend'],
    environment: 'Staging',
    dependencies: [],
    attachments: [],
    actionItems: [],
    checklist: [
      { id: 'FEA-002-chk-1', title: 'Draft export UI', completed: true, assigneeId: 'u1' },
      { id: 'FEA-002-chk-2', title: 'Wire backend API', completed: false, assigneeId: 'u6' },
      { id: 'FEA-002-chk-3', title: 'Document usage scenarios', completed: false, assigneeId: 'u7' },
    ],
    comments: [],
    slaEvents: [],
    slaState: 'WithinSLA',
    auditLog: [{ id: 'audit-4', action: 'Status updated', actorId: 'u7', detail: 'Moved to QA', timestamp: '2026-01-20T08:00:00Z' }],
    createdBy: 'u6',
    createdAt: '2026-01-14T10:00:00Z',
    modifiedBy: 'u7',
    modifiedAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'REL-005',
    workItemType: 'Release',
    title: 'Version 2.5.0 Production Deployment',
    description: 'Coordinate release of version 2.5.0 with DB migrations and release notes.',
    customer: 'Enterprise',
    project: 'Release Mgmt',
    module: 'Ops',
    priority: 'P1',
    status: 'New',
    slaPolicyId: 'default',
    teamId: 'eng',
    department: 'Platform',
    ownerId: 'u2',
    approverId: 'u6',
    plannedStart: '2026-01-25T08:00:00Z',
    dueDate: '2026-02-12T20:00:00Z',
    actualStart: undefined,
    actualEnd: undefined,
    effortEstimate: 32,
    effortSpent: 0,
    tags: ['release', 'ops'],
    components: ['infra', 'backend'],
    environment: 'Prod',
    dependencies: ['FEA-002'],
    attachments: [],
    actionItems: [],
    checklist: [
      { id: 'REL-005-chk-1', title: 'Confirm migration plan', completed: false, assigneeId: 'u2' },
      { id: 'REL-005-chk-2', title: 'Publish release notes', completed: false, assigneeId: 'u6' },
    ],
    comments: [],
    slaEvents: [],
    slaState: 'WithinSLA',
    auditLog: [{ id: 'audit-5', action: 'Created', actorId: 'u2', detail: 'Release draft created', timestamp: '2026-01-12T14:00:00Z' }],
    createdBy: 'u2',
    createdAt: '2026-01-12T14:00:00Z',
    modifiedBy: 'u2',
    modifiedAt: '2026-01-12T14:00:00Z',
  },
];

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

const initialWorklogs: Worklog[] = [
  {
    id: 'log-1',
    workItemId: 'DEV-010',
    userId: 'u2',
    action: 'start',
    timestamp: '2026-01-21T09:00:00Z',
    durationMinutes: 120,
    notes: 'Initial pipeline review',
  },
  {
    id: 'log-2',
    workItemId: 'DEV-010',
    userId: 'u4',
    action: 'pause',
    timestamp: '2026-01-21T11:10:00Z',
    durationMinutes: 90,
    notes: 'Blocked by flaky tests',
  },
  {
    id: 'log-3',
    workItemId: 'SUP-001',
    userId: 'u3',
    action: 'start',
    timestamp: '2026-01-21T13:00:00Z',
    durationMinutes: 45,
    notes: 'Investigating SSO token refresh',
  },
];

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

const initialNotes: Note[] = [
  {
    id: 'note-1',
    type: 'CustomerMeeting',
    title: 'Quarterly Review with Acme Corporation',
    dateTime: '2024-01-18T14:00:00Z',
    customer: 'Acme Corporation',
    project: 'Support',
    participants: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
    summary: 'Discussed Q1 roadmap, custom branding, and API enhancements.',
    decisions: ['Prioritize SSO fix this week', 'Schedule custom branding demo', 'Provide dedicated support contact'],
    risks: ['SSO issues affecting trust', 'Custom branding timeline may conflict with release'],
    tags: ['quarterly-review', 'enterprise', 'roadmap'],
    actionItems: ['Schedule follow-up call to demo custom branding', 'Send weekly status updates on SSO fix'],
    linkedWorkItems: ['SUP-001', 'DEV-010'],
    createdBy: 'u3',
    recordingUrl: 'https://meetings.example.com/quarterly-review',
  },
  {
    id: 'note-2',
    type: 'InternalDiscussion',
    title: 'Sprint Planning - Week 4',
    dateTime: '2026-01-19T10:00:00Z',
    participants: ['Gomathi Arunraj', 'Leah Patel', 'Priya Nair'],
    summary: 'Align on bug fixes, deliverables, and QA ramp-up.',
    decisions: ['Lock sprint scope', 'Assign analytics export to QA'],
    risks: ['QA capacity may bottleneck exports'],
    tags: ['sprint', 'planning'],
    actionItems: ['Confirm QA availability', 'Share release notes draft'],
    linkedWorkItems: ['FEA-002', 'REL-005'],
    createdBy: 'u2',
    recordingUrl: 'https://meetings.example.com/sprint-planning',
  },
];

const initialNotificationRules: NotificationRule[] = [
  {
    id: 'rule-1',
    name: 'Due date reminder (email)',
    trigger: 'DueReminder',
    channel: 'Email',
    leadHours: 24,
    appliesToPriorities: ['P0', 'P1'],
    appliesToTypes: ['CustomerSupport', 'Feature', 'Release'],
    template: 'Reminder: {{WorkItemId}} – {{Title}} due in {{DueDate}}',
    active: true,
  },
  {
    id: 'rule-2',
    name: 'SLA risk ping (WhatsApp)',
    trigger: 'SLAAtRisk',
    channel: 'WhatsApp',
    appliesToPriorities: ['P0', 'P1', 'P2'],
    appliesToTypes: ['CustomerSupport', 'InternalDev'],
    template: 'SLA At Risk: {{WorkItemId}} is {{SLAState}}. Owner: {{Owner}}',
    active: true,
  },
];

const initialTimelinePlans: TimelinePlan[] = [
  {
    id: 'plan-1',
    name: 'Week 4 Sprint',
    startDate: '2026-01-19',
    endDate: '2026-01-25',
    plannedDeliveries: 8,
    teamCapacity: { eng: 160, support: 80, qa: 60 },
    burndownPercent: 55,
  },
];

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(initialWorkItems);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [worklogs, setWorklogs] = useState<Worklog[]>(initialWorklogs);
  const [teamList, setTeamList] = useState<Team[]>(initialTeams);
  const [slaPolicyList, setSlaPolicyList] = useState<SlaPolicy[]>(initialSlaPolicies);
  const [departments, setDepartments] = useState<string[]>(departmentMaster);
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const currentUserId = 'u3';
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [activeWorkItemId, setActiveWorkItemId] = useState<string | null>(null);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(initialNotificationRules);
  const [timelinePlans] = useState<TimelinePlan[]>(initialTimelinePlans);
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

  const addWorkItem = (item: WorkItem) => {
    setWorkItems((prev) => [...prev, item]);
  };

  const updateWorkItem = (id: string, patch: Partial<WorkItem>) => {
    setWorkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch, modifiedAt: new Date().toISOString() } : item)),
    );
  };

  const addNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  const updateNote = (id: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...patch } : note)),
    );
  };

  const addTeam = (entry: { name: string; department: string; keyskills: string; isActive: boolean }) => {
    const department = entry.department.trim();
    const code = department
      ? department.replace(/\s+/g, '').slice(0, 4).toUpperCase()
      : 'GEN';
    const teamName = entry.name.trim() || `Team ${code}`;
    const leadName = entry.name.trim() || 'Team lead';
    ensureDepartment(department);
    setTeamList((prev) => {
      const normalizedName = teamName.trim().toLowerCase();
      if (normalizedName && prev.some((team) => team.name.trim().toLowerCase() === normalizedName)) {
        return prev;
      }
      const teamId = `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const memberId = createTeamMember(leadName, teamId);
      const newTeam: Team = {
        id: teamId,
        name: teamName,
        code,
        lead: leadName,
        members: [memberId],
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

