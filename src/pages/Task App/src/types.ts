export type WorkItemType =
  | 'InternalDev'
  | 'CustomerSupport'
  | 'Feature'
  | 'ChangeRequest'
  | 'Release'
  | 'AITools'
  | 'MeetingAction'
  | 'DiscussionAction';

export type WorkItemStatus =
  | 'New'
  | 'Triaged'
  | 'InProgress'
  | 'Blocked'
  | 'QA'
  | 'UAT'
  | 'Delivered'
  | 'Closed'
  | 'Rejected'
  | 'OnHold';

export type WorkItemPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type SlaState = 'WithinSLA' | 'AtRisk' | 'Breached';
export type Environment = 'Dev' | 'Test' | 'Prod' | 'Staging' | 'None';

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Agent' | 'Viewer';
  avatar?: string;
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  lead: string;
  members: string[];
  department?: string;
  keyskills?: string;
  isActive?: boolean;
}

export interface ActionItem {
  id: string;
  title: string;
  assigneeIds: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface WorkItem {
  id: string;
  workItemType: WorkItemType;
  title: string;
  description: string;
  customer?: string;
  project?: string;
  module?: string;
  priority: WorkItemPriority;
  status: WorkItemStatus;
  slaPolicyId: string;
  teamId: string;
  ownerId: string;
  approverId?: string;
  plannedStart?: string;
  dueDate?: string;
  actualStart?: string;
  actualEnd?: string;
  effortEstimate: number;
  effortSpent: number;
  tags: string[];
  components: string[];
  environment: Environment;
  dependencies: string[];
  attachments: Attachment[];
  comments: CommentLog[];
  slaEvents: SlaEvent[];
  slaState: SlaState;
  checklist?: ChecklistItem[];
  auditLog: AuditEntry[];
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  department?: string;
  actionItems?: ActionItem[];
}

export interface Attachment {
  id: string;
  label: string;
  type: 'file' | 'link';
  url: string;
  uploadedBy: string;
}

export interface CommentLog {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

export interface SlaPolicy {
  id: string;
  name: string;
  appliesTo: WorkItemType[];
  stageDurations: Record<string, number>; // hours per stage
  businessHours: boolean;
  breachThresholdPct: number;
  reminderWindowHours: number;
  holidays: string[];
}

export interface SlaEvent {
  id: string;
  workItemId: string;
  stageName: string;
  stageStart: string;
  stageEnd?: string;
  stageDurationHours?: number;
  slaStatus: SlaState;
}

export interface AuditEntry {
  id: string;
  action: string;
  actorId: string;
  detail: string;
  timestamp: string;
}

export interface Note {
  id: string;
  type: 'CustomerMeeting' | 'InternalDiscussion';
  title: string;
  dateTime: string;
  customer?: string;
  project?: string;
  participants: string[];
  summary: string;
  decisions: string[];
  risks: string[];
  tags: string[];
  actionItems: string[];
  linkedWorkItems: string[];
  createdBy: string;
  recordingUrl?: string;
}

export interface TimelinePlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  plannedDeliveries: number;
  teamCapacity: Record<string, number>;
  burndownPercent: number;
}

export interface NotificationRule {
  id: string;
  name: string;
  trigger: 'DueReminder' | 'SLAAtRisk' | 'SLABreach' | 'DeliveredOrClosed' | 'OwnerReassigned' | 'Mention';
  channel: 'Email' | 'WhatsApp';
  leadHours?: number;
  appliesToPriorities: WorkItemPriority[];
  appliesToTypes: WorkItemType[];
  template: string;
  active: boolean;
}
