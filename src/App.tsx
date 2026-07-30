import { useState, useMemo, useCallback } from 'react';
import { mockCases, mockReviewers, mockClients } from './data/mockCases';
import { ReviewCase, CaseStatus, CaseHistory, StateTransition, AuditEntry } from './types';
import { QueueTable } from './components/QueueTable';
import { QueueFilters } from './components/QueueFilters';
import { SavedViews } from './components/SavedViews';
import { CaseDetailPanel } from './components/CaseDetailPanel';
import { AccountHistoryModal } from './components/AccountHistoryModal';
import { Search, ChevronDown } from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState<CaseStatus | ''>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');
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
      notes: selectedCase.notes ? [selectedCase.notes] : [],
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
              action: 'Status changed',
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

  const handleAssigneeChange = (caseId: string, newAssignee: string) => {
    const existing = cases.find((c) => c.id === caseId);
    const nextAssignee = newAssignee || undefined;
    if (!existing || existing.assignee === nextAssignee) return;

    const now = new Date();

    setCaseHistories((prev) => {
      const prior = prev[caseId] || buildSeedHistory(existing);
      return {
        ...prev,
        [caseId]: {
          stateHistory: prior.stateHistory,
          auditTrail: [
            {
              timestamp: now,
              actor: 'Current User',
              action: nextAssignee ? 'Case assigned' : 'Case unassigned',
              prior: existing.assignee || 'Unassigned',
              current: nextAssignee || 'Unassigned',
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
    priority?: string;
    assignee?: string;
    isOverdue?: boolean;
  }) => {
    setFilterStatus(filters.status || '');
    setFilterPriority(filters.priority || '');
    setFilterAssignee(filters.assignee || '');
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

  return (
    <div className="min-h-screen bg-esusu-gray-light flex flex-col">
      {/* Top Header */}
      <header className="bg-esusu-teal text-white sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium flex items-center gap-2">
              Recent <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded bg-white/20 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <button className="text-sm hover:text-gray-200">Need Help?</button>
            <button className="text-sm hover:text-gray-200">👤</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-esusu-gray-border">
          <nav className="p-4 space-y-6">
            {/* RAAS Section */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 px-3">RAAS</h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-3 py-2 rounded bg-esusu-green-light text-esusu-green font-medium text-sm hover:bg-esusu-green/10">
                    Admin Review Queue
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-3 py-2 rounded text-gray-700 text-sm hover:bg-gray-100">
                    Clients
                  </button>
                </li>
              </ul>
            </div>

            {/* Other Sections */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-3 px-3">MANAGED B2B</h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-3 py-2 rounded text-gray-700 text-sm hover:bg-gray-100">
                    Residents
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-3 py-2 rounded text-gray-700 text-sm hover:bg-gray-100">
                    Institutions
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Review Queue</h1>
              <p className="text-sm text-gray-600">Manage and track resident account reviews</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded border border-esusu-gray-border">
                <p className="text-xs text-gray-600 mb-1">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">{activeCaseCount}</p>
              </div>
              <div className="bg-white p-4 rounded border border-esusu-gray-border">
                <p className="text-xs text-gray-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
              <div className="bg-white p-4 rounded border border-esusu-gray-border">
                <p className="text-xs text-gray-600 mb-1">Assigned to Me</p>
                <p className="text-2xl font-bold text-gray-900">{cases.filter(c => c.assignee === 'Alice Chen').length}</p>
              </div>
              <div className="bg-white p-4 rounded border border-esusu-gray-border">
                <p className="text-xs text-gray-600 mb-1">Escalated</p>
                <p className="text-2xl font-bold text-gray-900">{cases.filter(c => c.status === 'Escalated').length}</p>
              </div>
            </div>

            {/* Saved Views */}
            <SavedViews onViewSelect={handleViewSelect} />

            {/* Filters */}
            <QueueFilters
              statuses={allStatuses}
              priorities={allPriorities as any}
              assignees={mockReviewers}
              clients={mockClients}
              onStatusChange={(status) => setFilterStatus(status)}
              onPriorityChange={(priority) => setFilterPriority(priority)}
              onAssigneeChange={(assignee) => {
                if (assignee === 'unassigned') {
                  setFilterAssignee('UNASSIGNED_FILTER');
                } else {
                  setFilterAssignee(assignee);
                }
              }}
              onClientChange={(client) => setFilterClient(client)}
            />

            {/* Queue Table */}
            <div className="mt-6">
              <QueueTable
                cases={cases}
                onSelectCase={(caseId) => {
                  setSelectedCaseId(caseId);
                  setShowHistory(false);
                }}
                filterStatus={filterStatus as CaseStatus | undefined}
                filterPriority={filterPriority as any}
                filterAssignee={
                  filterAssignee === 'UNASSIGNED_FILTER'
                    ? undefined
                    : filterAssignee || undefined
                }
                filterClient={filterClient || undefined}
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
