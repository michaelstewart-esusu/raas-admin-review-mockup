export const CASE_STATUSES = [
  'New',
  'Assigned',
  'In Review',
  'Waiting for Verification',
  'Done',
  'Awaiting Consumer Action',
  'Closed',
  'Deleted',
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'] as const;

export type CasePriority = (typeof CASE_TIERS)[number];
export type ReviewReason =
  | 'p2p_deviation'
  | 'no_user_labels'
  | 'competing_product'
  | 'transaction_deviation_non_p2p'
  | 'ai_label_conflict'
  | 'no_admin_labels'
  | 'plaid_disconnected'
  | 'ai_transaction_deviation'
  | 'regular_payment';
export type EscalationType = 'fraud' | 'duplicate_tradeline' | 'ambiguity' | 'documentation_needed' | 'reporting_conflict' | 'high_risk_p2p';

export interface ConsumerEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
  sentBy: string;
}

export interface ReviewCase {
  id: string;
  residentName: string;
  accountId: string;
  client: string;
  consumerEmail?: string;
  property?: string;
  leaseStatus?: string;
  reason: ReviewReason;
  priority: CasePriority;
  status: CaseStatus;
  assignee?: string;
  createdAt: Date;
  dueDate: Date;
  paymentType?: string;
  reportingState?: string;
  priorReviewCount: number;
  escalationState?: EscalationType;
  notes?: string[];
  emails?: ConsumerEmail[];
}

export type StateChangeKind = 'status' | 'assignee' | 'note' | 'email';

export interface StateTransition {
  kind: StateChangeKind;
  fromState: string;
  toState: string;
  timestamp: Date;
  actor: string;
  reason?: string;
}

export interface AuditEntry {
  timestamp: Date;
  actor: string;
  action: string;
  prior?: string;
  current?: string;
  reason?: string;
}

export interface CaseHistory {
  caseId: string;
  residentName: string;
  accountId: string;
  currentStatus: CaseStatus;
  currentAssignee?: string;
  currentReason: ReviewReason;
  priorReviews: ReviewCase[];
  stateHistory: StateTransition[];
  auditTrail: AuditEntry[];
  notes: string[];
  emails: ConsumerEmail[];
}
