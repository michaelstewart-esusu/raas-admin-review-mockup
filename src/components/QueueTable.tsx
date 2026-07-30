import React, { useMemo, useState } from 'react';
import { ReviewCase, CasePriority, CaseStatus } from '../types';
import { getReasonLabel } from '../data/reasonLabels';
import { formatDistanceToNow, isPast } from 'date-fns';
import { AlertCircle, Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface QueueTableProps {
  cases: ReviewCase[];
  onSelectCase: (caseId: string) => void;
  filterStatus?: CaseStatus;
  filterAssignee?: string;
  filterPriority?: CasePriority;
  filterClient?: string;
}

type SortField = 'residentName' | 'accountId' | 'client' | 'reason' | 'priority' | 'status' | 'assignee' | 'queueAge' | 'dueDate';
type SortDirection = 'asc' | 'desc';

const statusColors: Record<CaseStatus, string> = {
  'New': 'bg-blue-50 text-blue-700',
  'Assigned': 'bg-gray-50 text-gray-700',
  'In Review': 'bg-yellow-50 text-yellow-700',
  'Waiting for Verification': 'bg-orange-50 text-orange-700',
  'Escalated': 'bg-red-50 text-red-700',
  'Done': 'bg-esusu-green-light text-esusu-green',
  'Closed': 'bg-gray-50 text-gray-700',
  'OH/DA Pending': 'bg-purple-50 text-purple-700',
  'Closure Pending': 'bg-pink-50 text-pink-700',
};

const priorityColors: Record<CasePriority, string> = {
  'P0': 'bg-red-100 text-red-800 font-bold',
  'P1': 'bg-orange-100 text-orange-800 font-semibold',
  'P2': 'bg-yellow-100 text-yellow-800',
};


export const QueueTable: React.FC<QueueTableProps> = ({
  cases,
  onSelectCase,
  filterStatus,
  filterAssignee,
  filterPriority,
  filterClient,
}) => {
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getQueueAge = (createdAt: Date): number => {
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate: Date): boolean => {
    return isPast(dueDate);
  };

  const getPriorityValue = (priority: CasePriority): number => {
    const map: Record<CasePriority, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
    return map[priority];
  };

  const filteredAndSortedCases = useMemo(() => {
    let filtered = cases.filter((c) => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterAssignee && c.assignee !== filterAssignee) return false;
      if (filterPriority && c.priority !== filterPriority) return false;
      if (filterClient && c.client !== filterClient) return false;
      return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal: any;
      let bVal: any;

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

    return sorted;
  }, [cases, filterStatus, filterAssignee, filterPriority, filterClient, sortField, sortDirection]);

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <th
      className="px-6 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-esusu-gray-light transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4 text-esusu-green" />
          ) : (
            <ChevronDown className="w-4 h-4 text-esusu-green" />
          )
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded border border-esusu-gray-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-esusu-gray-light border-b border-esusu-gray-border">
          <tr>
            <SortHeader field="residentName" label="Resident" />
            <SortHeader field="accountId" label="Account ID" />
            <SortHeader field="client" label="Client" />
            <SortHeader field="reason" label="Reason" />
            <SortHeader field="priority" label="Priority" />
            <SortHeader field="status" label="Status" />
            <SortHeader field="assignee" label="Assignee" />
            <SortHeader field="queueAge" label="Queue Age" />
            <SortHeader field="dueDate" label="Due Date" />
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedCases.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
                  className={`border-b border-esusu-gray-border hover:bg-gray-50 cursor-pointer transition-colors ${
                    overdue ? 'bg-red-50' : ''
                  }`}
                  onClick={() => onSelectCase(reviewCase.id)}
                >
                  <td className="px-6 py-4 font-medium text-esusu-green hover:underline">
                    {reviewCase.residentName}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600 text-xs">
                    {reviewCase.accountId}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{reviewCase.client}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {getReasonLabel(reviewCase.reason)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded font-semibold text-xs ${priorityColors[reviewCase.priority]}`}>
                      {reviewCase.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${statusColors[reviewCase.status]}`}>
                      {reviewCase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reviewCase.assignee || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {queueAge}d
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${ overdue ? 'text-red-700 font-semibold' : 'text-gray-700' }`}>
                    <div className="flex items-center gap-1">
                      {overdue && <AlertCircle className="w-4 h-4 text-red-600" />}
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
  );
};
