import React, { useMemo, useState } from 'react';
import { ReviewCase, CasePriority, CaseStatus } from '../types';
import { getReasonLabel } from '../data/reasonLabels';
import { formatDistanceToNow, isPast } from 'date-fns';
import { AlertCircle, Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface QueueTableProps {
  cases: ReviewCase[];
  onSelectCase: (caseId: string) => void;
  filterStatuses?: CaseStatus[];
  filterAssignees?: string[];
  filterPriorities?: CasePriority[];
  filterClients?: string[];
  hideClosedAndDone?: boolean;
  hideTier4?: boolean;
}

type SortField = 'residentName' | 'accountId' | 'client' | 'reason' | 'priority' | 'status' | 'assignee' | 'queueAge' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const statusColors: Record<CaseStatus, string> = {
  'New': 'bg-sky-50 text-sky-800 ring-sky-200',
  'Assigned': 'bg-esusu-gray-light text-esusu-ink-muted ring-esusu-gray-border',
  'In Review': 'bg-amber-50 text-amber-800 ring-amber-200',
  'Waiting for Verification': 'bg-orange-50 text-orange-800 ring-orange-200',
  'Done': 'bg-esusu-green-light text-esusu-teal ring-esusu-green-muted',
  'Awaiting Consumer Action': 'bg-violet-50 text-violet-800 ring-violet-200',
  'Closed': 'bg-esusu-gray-light text-esusu-ink-muted ring-esusu-gray-border',
  'Deleted': 'bg-red-50 text-red-700 ring-red-200',
};

const priorityColors: Record<CasePriority, string> = {
  'Tier 1': 'bg-red-100 text-red-800 ring-red-200 font-bold',
  'Tier 2': 'bg-orange-100 text-orange-800 ring-orange-200 font-semibold',
  'Tier 3': 'bg-amber-100 text-amber-800 ring-amber-200 font-medium',
  'Tier 4': 'bg-esusu-green-light text-esusu-teal ring-esusu-green-muted font-medium',
};

export const QueueTable: React.FC<QueueTableProps> = ({
  cases,
  onSelectCase,
  filterStatuses = [],
  filterAssignees = [],
  filterPriorities = [],
  filterClients = [],
  hideClosedAndDone = false,
  hideTier4 = false,
}) => {
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getQueueAge = (createdAt: Date): number => {
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate: Date): boolean => isPast(dueDate);

  const getPriorityValue = (priority: CasePriority): number => {
    const map: Record<CasePriority, number> = {
      'Tier 1': 1,
      'Tier 2': 2,
      'Tier 3': 3,
      'Tier 4': 4,
    };
    return map[priority];
  };

  const filteredAndSortedCases = useMemo(() => {
    const filtered = cases.filter((c) => {
      if (filterStatuses.length > 0) {
        if (!filterStatuses.includes(c.status)) return false;
      } else if (hideClosedAndDone && (c.status === 'Closed' || c.status === 'Done')) {
        // No explicit status selection: hide Closed/Done when the toggle is on.
        // Explicitly selecting Closed/Done in the status filter still shows them.
        return false;
      }

      if (filterPriorities.length > 0) {
        if (!filterPriorities.includes(c.priority)) return false;
      } else if (hideTier4 && c.priority === 'Tier 4') {
        // An explicit Tier 4 selection overrides the default hide behavior.
        return false;
      }
      if (filterClients.length > 0 && !filterClients.includes(c.client)) return false;
      if (filterAssignees.length > 0) {
        const assigneeKey = c.assignee ?? '__unassigned__';
        if (!filterAssignees.includes(assigneeKey)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'residentName':
          aVal = a.residentName.toLowerCase();
          bVal = b.residentName.toLowerCase();
          break;
        case 'accountId':
          aVal = a.accountId.toLowerCase();
          bVal = b.accountId.toLowerCase();
          break;
        case 'client':
          aVal = a.client.toLowerCase();
          bVal = b.client.toLowerCase();
          break;
        case 'reason':
          aVal = getReasonLabel(a.reason).toLowerCase();
          bVal = getReasonLabel(b.reason).toLowerCase();
          break;
        case 'priority':
          aVal = getPriorityValue(a.priority);
          bVal = getPriorityValue(b.priority);
          break;
        case 'status':
          aVal = a.status.toLowerCase();
          bVal = b.status.toLowerCase();
          break;
        case 'assignee':
          aVal = (a.assignee || '').toLowerCase();
          bVal = (b.assignee || '').toLowerCase();
          break;
        case 'queueAge':
          aVal = getQueueAge(a.createdAt);
          bVal = getQueueAge(b.createdAt);
          break;
        case 'dueDate':
          aVal = a.dueDate.getTime();
          bVal = b.dueDate.getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cases, filterStatuses, filterAssignees, filterPriorities, filterClients, hideClosedAndDone, hideTier4, sortField, sortDirection]);

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th
      className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-esusu-ink-muted cursor-pointer hover:text-esusu-ink hover:bg-esusu-green-light/50 transition-colors whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-3.5 h-3.5 text-esusu-green" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-esusu-green" />
          )
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg border border-esusu-gray-border overflow-hidden shadow-panel">
      <div className="px-4 py-2.5 border-b border-esusu-gray-border bg-esusu-gray-light/70 flex items-center justify-between">
        <p className="text-xs font-semibold text-esusu-ink-muted">
          {filteredAndSortedCases.length} case{filteredAndSortedCases.length === 1 ? '' : 's'}
        </p>
        <p className="text-[11px] text-esusu-ink-subtle">Click a row to open case details</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-esusu-gray-light border-b border-esusu-gray-border">
            <tr>
              <SortHeader field="residentName" label="Resident" />
              <SortHeader field="accountId" label="Account ID" />
              <SortHeader field="client" label="Client" />
              <SortHeader field="reason" label="Reason" />
              <SortHeader field="priority" label="Tier" />
              <SortHeader field="status" label="Status" />
              <SortHeader field="assignee" label="Assignee" />
              <SortHeader field="queueAge" label="Queue Age" />
              <SortHeader field="dueDate" label="Due Date" />
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCases.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-esusu-ink-muted">
                  No cases found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedCases.map((reviewCase) => {
                const overdue = isOverdue(reviewCase.dueDate);
                const queueAge = getQueueAge(reviewCase.createdAt);

                return (
                  <tr
                    key={reviewCase.id}
                    className={`border-b border-esusu-gray-border last:border-b-0 hover:bg-esusu-green-light/40 cursor-pointer transition-colors ${
                      overdue ? 'bg-red-50/70' : ''
                    }`}
                    onClick={() => onSelectCase(reviewCase.id)}
                  >
                    <td className="px-4 py-3 font-semibold text-esusu-green hover:text-esusu-green-hover hover:underline whitespace-nowrap">
                      {reviewCase.residentName}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-esusu-ink-muted whitespace-nowrap">
                      {reviewCase.accountId}
                    </td>
                    <td className="px-4 py-3 text-esusu-ink whitespace-nowrap">{reviewCase.client}</td>
                    <td className="px-4 py-3 text-esusu-ink">
                      {getReasonLabel(reviewCase.reason)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] ring-1 ring-inset ${priorityColors[reviewCase.priority]}`}>
                        {reviewCase.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${statusColors[reviewCase.status]}`}>
                        {reviewCase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-esusu-ink whitespace-nowrap">
                      {reviewCase.assignee || '—'}
                    </td>
                    <td className="px-4 py-3 text-esusu-ink-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-esusu-ink-subtle" />
                        {queueAge}d
                      </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap ${overdue ? 'text-red-700 font-semibold' : 'text-esusu-ink-muted'}`}>
                      <div className="flex items-center gap-1.5">
                        {overdue && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                        {formatDistanceToNow(reviewCase.dueDate, { addSuffix: true })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
