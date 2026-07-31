import { useState, useMemo, useCallback } from 'react';
import { mockCases, mockReviewers, mockClients } from './data/mockCases';
import { ReviewCase, CaseStatus, CasePriority, CaseHistory, StateTransition, AuditEntry } from './types';
import { QueueTable } from './components/QueueTable';
import { QueueFilters, UNASSIGNED_ASSIGNEE } from './components/QueueFilters';
import { SavedViews } from './components/SavedViews';
import { CaseDetailPanel } from './components/CaseDetailPanel';
import { AccountHistoryModal } from './components/AccountHistoryModal';
import {
  Search,
  ChevronDown,
  HelpCircle,
  LayoutList,
  Building2,
  Users,
  Landmark,
  ClipboardList,
  AlertTriangle,
  User,
  Flame,
} from 'lucide-react';

type CaseHistoryRecord = {
  stateHistory: StateTransition[];
  auditTrail: AuditEntry[];
};

function buildSeedHistory(reviewCase: ReviewCase): CaseHistoryRecord {
  const createdAt = reviewCase.createdAt;
  const actor = reviewCase.assignee || 'System';
  const stateHistory: StateTransition[] = [];

  if (reviewCase.status !== 'New') {
    stateHistory.push({
      kind: 'status',
      fromState: 'New',
      toState: reviewCase.status,
      timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60),
      actor,
    });
  }

  const auditTrail: AuditEntry[] = [
    {
      timestamp: new Date(createdAt.getTime() + 1000 * 60),
      actor: 'System',
      action: 'Case created',
      current: 'New',
    },
  ];

  if (reviewCase.assignee) {
    stateHistory.push({
      kind: 'assignee',
      fromState: 'Unassigned',
      toState: reviewCase.assignee,
      timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60),
      actor: 'System',
    });
    auditTrail.unshift({
      timestamp: new Date(createdAt.getTime() + 1000 * 60 * 60),
      actor: 'System',
      action: 'Case assigned',
      current: reviewCase.assignee,
    });
  }

  return { stateHistory, auditTrail };
}

function App() {
  const [cases, setCases] = useState<ReviewCase[]>(mockCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [filterStatuses, setFilterStatuses] = useState<CaseStatus[]>([]);
  const [filterAssignees, setFilterAssignees] = useState<string[]>([]);
  const [filterPriorities, setFilterPriorities] = useState<CasePriority[]>([]);
  const [filterClients, setFilterClients] = useState<string[]>([]);
  const [hideClosedAndDone, setHideClosedAndDone] = useState(true);
  const [caseHistories, setCaseHistories] = useState<Record<string, CaseHistoryRecord>>({});

  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [selectedCaseId, cases]);

  const ensureHistory = useCallback((reviewCase: ReviewCase): CaseHistoryRecord => {
    return caseHistories[reviewCase.id] || buildSeedHistory(reviewCase);
  }, [caseHistories]);

  const accountHistory: CaseHistory | null = useMemo(() => {
    if (!selectedCase) return null;

    const history = ensureHistory(selectedCase);

    return {
      caseId: selectedCase.id,
      residentName: selectedCase.residentName,
      accountId: selectedCase.accountId,
      priorReviews: cases
        .filter((c) => c.accountId === selectedCase.accountId && c.id !== selectedCase.id)
        .slice(0, 3),
      stateHistory: [...history.stateHistory].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      ),
      auditTrail: [...history.auditTrail].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      ),
      notes: selectedCase.notes ? [...selectedCase.notes] : [],
      currentStatus: selectedCase.status,
      currentAssignee: selectedCase.assignee,
      currentReason: selectedCase.reason,
    };
  }, [selectedCase, cases, ensureHistory]);

  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    const existing = cases.find((c) => c.id === caseId);
    if (!existing || existing.status === newStatus) return;

    const actor = existing.assignee || 'Current User';
    const now = new Date();

    setCaseHistories((prev) => {
      const prior = prev[caseId] || buildSeedHistory(existing);
      return {
        ...prev,
        [caseId]: {
          stateHistory: [
            ...prior.stateHistory,
            {
              kind: 'status',
              fromState: existing.status,
              toState: newStatus,
              timestamp: now,
              actor,
            },
          ],
          auditTrail: [
            {
              timestamp: now,
              actor,
              action: newStatus === 'Closed' ? 'Case closed' : 'Status changed',
              prior: existing.status,
              current: newStatus,
            },
            ...prior.auditTrail,
          ],
        },
      };
    });

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
  };

  const handleAddNote = (caseId: string, note: string) => {
    const existing = cases.find((c) => c.id === caseId);
    if (!existing) return;

    const trimmed = note.trim();
    if (!trimmed) return;

    const now = new Date();
    const actor = existing.assignee || 'Current User';

    setCaseHistories((prev) => {
      const prior = prev[caseId] || buildSeedHistory(existing);
      return {
        ...prev,
        [caseId]: {
          stateHistory: [
            ...prior.stateHistory,
            {
              kind: 'note',
              fromState: '',
              toState: trimmed,
              timestamp: now,
              actor,
            },
          ],
          auditTrail: [
            {
              timestamp: now,
              actor,
              action: 'Note added',
              current: trimmed,
            },
            ...prior.auditTrail,
          ],
        },
      };
    });

    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? { ...c, notes: [...(c.notes ?? []), trimmed] }
          : c
      )
    );
  };

  const handleAssigneeChange = (caseId: string, newAssignee: string) => {
    const existing = cases.find((c) => c.id === caseId);
    const nextAssignee = newAssignee || undefined;
    if (!existing || existing.assignee === nextAssignee) return;

    const now = new Date();
    const fromAssignee = existing.assignee || 'Unassigned';
    const toAssignee = nextAssignee || 'Unassigned';

    setCaseHistories((prev) => {
      const prior = prev[caseId] || buildSeedHistory(existing);
      return {
        ...prev,
        [caseId]: {
          stateHistory: [
            ...prior.stateHistory,
            {
              kind: 'assignee',
              fromState: fromAssignee,
              toState: toAssignee,
              timestamp: now,
              actor: 'Current User',
            },
          ],
          auditTrail: [
            {
              timestamp: now,
              actor: 'Current User',
              action: nextAssignee ? 'Case assigned' : 'Case unassigned',
              prior: fromAssignee,
              current: toAssignee,
            },
            ...prior.auditTrail,
          ],
        },
      };
    });

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, assignee: nextAssignee } : c))
    );
  };

  const handleViewSelect = (filters: {
    status?: CaseStatus;
    priority?: CasePriority;
    assignee?: string;
    isOverdue?: boolean;
  }) => {
    setFilterStatuses(filters.status ? [filters.status] : []);
    setFilterPriorities(filters.priority ? [filters.priority] : []);
    if (!filters.assignee) {
      setFilterAssignees([]);
    } else if (filters.assignee === 'unassigned') {
      setFilterAssignees([UNASSIGNED_ASSIGNEE]);
    } else {
      setFilterAssignees([filters.assignee]);
    }
    setFilterClients([]);
  };

  const allStatuses: CaseStatus[] = [
    'New',
    'Assigned',
    'In Review',
    'Waiting for Verification',
    'Escalated',
    'Done',
    'Closed',
    'OH/DA Pending',
    'Closure Pending',
  ];

  const allPriorities = ['P0', 'P1', 'P2'];

  const activeCaseCount = cases.filter(
    (c) => !['Done', 'Closed'].includes(c.status)
  ).length;

  const overdueCount = cases.filter(
    (c) => new Date() > c.dueDate && !['Done', 'Closed'].includes(c.status)
  ).length;

  const assignedToMeCount = cases.filter((c) => c.assignee === 'Alice Chen').length;
  const escalatedCount = cases.filter((c) => c.status === 'Escalated').length;

  return (
    <div className="min-h-screen bg-esusu-canvas flex flex-col font-sans text-esusu-ink">
      {/* Top Header */}
      <header className="bg-esusu-teal text-white sticky top-0 z-50 shadow-sm">
        <div className="h-14 px-4 md:px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded bg-esusu-green flex items-center justify-center text-xs font-bold tracking-tight">
                e
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight">esusu</div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/65">
                  Admin Console
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-white/80 hover:text-white cursor-default">
              Recent
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative w-44 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/55" />
              <input
                type="text"
                placeholder="Search console..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md bg-white/10 border border-white/10 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-esusu-green/40"
              />
            </div>
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-esusu-teal-mid border border-white/20 text-xs font-semibold hover:bg-esusu-green transition-colors"
              aria-label="Account menu"
            >
              AC
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-[232px] shrink-0 bg-white border-r border-esusu-gray-border hidden md:flex md:flex-col">
          <nav className="p-3 pt-5 space-y-6 flex-1 overflow-y-auto">
            <div>
              <h3 className="ac-section-title px-3 mb-2">RaaS</h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-md bg-esusu-green-light text-esusu-teal font-semibold text-sm border-l-[3px] border-esusu-green"
                  >
                    <LayoutList className="w-4 h-4 text-esusu-green" />
                    Admin Review Queue
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-md text-esusu-ink-muted text-sm hover:bg-esusu-gray-light hover:text-esusu-ink transition-colors"
                  >
                    <Building2 className="w-4 h-4" />
                    Clients
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="ac-section-title px-3 mb-2">Managed B2B</h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-md text-esusu-ink-muted text-sm hover:bg-esusu-gray-light hover:text-esusu-ink transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Residents
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-md text-esusu-ink-muted text-sm hover:bg-esusu-gray-light hover:text-esusu-ink transition-colors"
                  >
                    <Landmark className="w-4 h-4" />
                    Institutions
                  </button>
                </li>
              </ul>
            </div>
          </nav>
          <div className="p-4 border-t border-esusu-gray-border text-[11px] text-esusu-ink-subtle">
            RaaS Admin Review · Mockup
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] px-4 md:px-8 py-6 md:py-7">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-esusu-ink-subtle">
              RaaS / Admin Review
            </div>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-[28px] leading-tight font-semibold text-esusu-ink tracking-tight">
                  Admin Review Queue
                </h1>
                <p className="text-sm text-esusu-ink-muted mt-1">
                  Triage and resolve resident account reviews across clients
                </p>
              </div>
            </div>

            {/* Stats strip */}
            <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 bg-white border border-esusu-gray-border rounded-lg overflow-hidden shadow-panel">
              <div className="px-4 py-3.5 border-b lg:border-b-0 lg:border-r border-esusu-gray-border">
                <div className="flex items-center gap-2 text-esusu-ink-muted mb-1">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em]">Active Cases</p>
                </div>
                <p className="text-2xl font-semibold text-esusu-ink tabular-nums">{activeCaseCount}</p>
              </div>
              <div className="px-4 py-3.5 border-b lg:border-b-0 lg:border-r border-esusu-gray-border">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em]">Overdue</p>
                </div>
                <p className="text-2xl font-semibold text-red-700 tabular-nums">{overdueCount}</p>
              </div>
              <div className="px-4 py-3.5 border-b lg:border-b-0 lg:border-r border-esusu-gray-border">
                <div className="flex items-center gap-2 text-esusu-ink-muted mb-1">
                  <User className="w-3.5 h-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em]">Assigned to Me</p>
                </div>
                <p className="text-2xl font-semibold text-esusu-ink tabular-nums">{assignedToMeCount}</p>
              </div>
              <div className="px-4 py-3.5">
                <div className="flex items-center gap-2 text-esusu-ink-muted mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em]">Escalated</p>
                </div>
                <p className="text-2xl font-semibold text-esusu-ink tabular-nums">{escalatedCount}</p>
              </div>
            </div>

            {/* Saved Views */}
            <SavedViews onViewSelect={handleViewSelect} />

            {/* Filters */}
            <QueueFilters
              statuses={allStatuses}
              priorities={allPriorities as CasePriority[]}
              assignees={mockReviewers}
              clients={mockClients}
              selectedStatuses={filterStatuses}
              selectedPriorities={filterPriorities}
              selectedAssignees={filterAssignees}
              selectedClients={filterClients}
              hideClosedAndDone={hideClosedAndDone}
              onStatusesChange={setFilterStatuses}
              onPrioritiesChange={setFilterPriorities}
              onAssigneesChange={setFilterAssignees}
              onClientsChange={setFilterClients}
              onHideClosedAndDoneChange={setHideClosedAndDone}
            />

            {/* Queue Table */}
            <div className="mt-4">
              <QueueTable
                cases={cases}
                onSelectCase={(caseId) => {
                  setSelectedCaseId(caseId);
                  setShowHistory(false);
                }}
                filterStatuses={filterStatuses}
                filterPriorities={filterPriorities}
                filterAssignees={filterAssignees}
                filterClients={filterClients}
                hideClosedAndDone={hideClosedAndDone}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Case Detail Panel */}
      <CaseDetailPanel
        reviewCase={selectedCase}
        onClose={() => setSelectedCaseId(null)}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        onAddNote={handleAddNote}
        onShowHistory={() => setShowHistory(true)}
        reviewers={mockReviewers}
      />

      {/* Account History Modal */}
      {showHistory && (
        <AccountHistoryModal history={accountHistory} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default App;
