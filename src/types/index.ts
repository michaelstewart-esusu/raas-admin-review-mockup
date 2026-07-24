export type CaseStatus = 'New' | 'Assigned' | 'In Review' | 'Waiting for Verification' | 'Escalated' | 'Done' | 'Closed' | 'OH/DA Pending' | 'Closure Pending';
export type CasePriority = 'P0' | 'P1' | 'P2';
export type ReviewReason = 'label_conflict' | 'possible_p2p' | 'fraud_risk' | 'no_qualifying_rent' | 'reporting_mismatch' | 'account_disconnected' | 'oh_da_needed' | 'closure_needed';
export type EscalationType = 'fraud' | 'duplicate_tradeline' | 'ambiguity' | 'documentation_needed' | 'reporting_conflict' | 'high_risk_p2p';

export interface ReviewCase {
  id: string;
  residentName: string;
  accountId: string;
  client: string;
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
  notes?: string;
}

export interface StateTransition {
  fromState: CaseStatus;
  toState: CaseStatus;
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
  priorReviews: ReviewCase[];
  stateHistory: StateTransition[];
  auditTrail: AuditEntry[];
  notes: string[];
}
