import React, { useState, useMemo } from 'react';
import { mockCases, mockReviewers, mockClients } from './data/mockCases';
import { ReviewCase, CaseStatus, CaseHistory } from './types';
import { QueueTable } from './components/QueueTable';
import { QueueFilters } from './components/QueueFilters';
import { SavedViews } from './components/SavedViews';
import { CaseDetailPanel } from './components/CaseDetailPanel';
import { AccountHistoryModal } from './components/AccountHistoryModal';
import { BarChart3 } from 'lucide-react';

function App() {
  const [cases, setCases] = useState<ReviewCase[]>(mockCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState<CaseStatus | ''>('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterClient, setFilterClient] = useState<string>('');

  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [selectedCaseId, cases]);

  // Mock account history
  const mockAccountHistory: CaseHistory | null = selectedCase
    ? {
        caseId: selectedCase.id,
        residentName: selectedCase.residentName,
        accountId: selectedCase.accountId,
        priorReviews: cases
          .filter((c) => c.accountId === selectedCase.accountId && c.id !== selectedCase.id)
          .slice(0, 3),
        stateHistory: [
          {
            fromState: 'New',
            toState: 'Assigned',
            timestamp: new Date(selectedCase.createdAt.getTime() + 1000 * 60 * 60),
            actor: 'System',
          },
          {
            fromState: 'Assigned',
            toState: 'In Review',
            timestamp: new Date(selectedCase.createdAt.getTime() + 1000 * 60 * 60 * 2),
            actor: selectedCase.assignee || 'Unknown',
          },
        ],
        auditTrail: [
          {
            timestamp: new Date(),
            actor: selectedCase.assignee || 'System',
            action: 'Case assigned',
            current: selectedCase.assignee,
          },
          {
            timestamp: new Date(selectedCase.createdAt.getTime() + 1000 * 60),
            actor: 'System',
            action: 'Case created',
            current: 'New',
          },
        ],
        notes: selectedCase.notes ? [selectedCase.notes] : [],
      }
    : null;

  const handleStatusChange = (caseId: string, newStatus: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
    );
  };

  const handleAssigneeChange = (caseId: string, newAssignee: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, assignee: newAssignee || undefined } : c))
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
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">RaaS Admin Review Queue</h1>
                <p className="text-sm text-slate-600">Mockup - Non-connected data</p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <p className="text-slate-600">Active Cases</p>
                <p className="text-2xl font-bold text-slate-900">{activeCaseCount}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
      </main>

      {/* Case Detail Panel */}
      <CaseDetailPanel
        reviewCase={selectedCase}
        onClose={() => setSelectedCaseId(null)}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        reviewers={mockReviewers}
      />

      {/* Account History Modal */}
      <AccountHistoryModal history={mockAccountHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}

export default App;
