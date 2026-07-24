import React, { useState, useMemo } from 'react';
import { mockCases, mockReviewers, mockClients } from './data/mockCases';
import { ReviewCase, CaseStatus, CaseHistory } from './types';
import { QueueTable } from './components/QueueTable';
import { QueueFilters } from './components/QueueFilters';
import { SavedViews } from './components/SavedViews';
import { CaseDetailPanel } from './components/CaseDetailPanel';
import { AccountHistoryModal } from './components/AccountHistoryModal';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';

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
        <AccountHistoryModal history={mockAccountHistory} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}

export default App;
