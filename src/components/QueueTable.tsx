import React, { useMemo } from 'react';
import { ReviewCase, CasePriority, CaseStatus } from '../types';
import { formatDistanceToNow, isPast } from 'date-fns';
import { AlertCircle, Clock } from 'lucide-react';

interface QueueTableProps {
  cases: ReviewCase[];
  onSelectCase: (caseId: string) => void;
  filterStatus?: CaseStatus;
  filterAssignee?: string;
  filterPriority?: CasePriority;
  filterClient?: string;
}

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

const reasonLabels: Record<string, string> = {
  'label_conflict': 'Label Conflict',
  'possible_p2p': 'Possible P2P',
  'fraud_risk': 'Fraud Risk',
  'no_qualifying_rent': 'No Qualifying Rent',
  'reporting_mismatch': 'Reporting Mismatch',
  'account_disconnected': 'Account Disconnected',
  'oh_da_needed': 'OH/DA Needed',
  'closure_needed': 'Closure Needed',
};

export const QueueTable: React.FC<QueueTableProps> = ({
  cases,
  onSelectCase,
  filterStatus,
  filterAssignee,
  filterPriority,
  filterClient,
}) => {
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      if (filterStatus && c.status !== filterStatus) return false;
      if (filterAssignee && c.assignee !== filterAssignee) return false;
      if (filterPriority && c.priority !== filterPriority) return false;
      if (filterClient && c.client !== filterClient) return false;
      return true;
    });
  }, [cases, filterStatus, filterAssignee, filterPriority, filterClient]);

  const getQueueAge = (createdAt: Date): number => {
    const now = new Date();
    return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate: Date): boolean => {
    return isPast(dueDate);
  };

  return (
    <div className="bg-white rounded border border-esusu-gray-border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-esusu-gray-light border-b border-esusu-gray-border">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Resident</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Account ID</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Client</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Reason</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Priority</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Assignee</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Queue Age</th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                No cases found matching your filters.
              </td>
            </tr>
          ) : (
            filteredCases.map((reviewCase) => {
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
                    {reasonLabels[reviewCase.reason] || reviewCase.reason}
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
