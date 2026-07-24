import React, { useMemo } from 'react';
import { ReviewCase, CasePriority, CaseStatus } from '../types';
import { formatDistanceToNow, isPast } from 'date-fns';
import { ChevronRight, AlertCircle, Clock } from 'lucide-react';

interface QueueTableProps {
  cases: ReviewCase[];
  onSelectCase: (caseId: string) => void;
  filterStatus?: CaseStatus;
  filterAssignee?: string;
  filterPriority?: CasePriority;
  filterClient?: string;
}

const statusColors: Record<CaseStatus, string> = {
  'New': 'bg-blue-100 text-blue-800',
  'Assigned': 'bg-gray-100 text-gray-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  'Waiting for Verification': 'bg-orange-100 text-orange-800',
  'Escalated': 'bg-red-100 text-red-800',
  'Done': 'bg-green-100 text-green-800',
  'Closed': 'bg-slate-100 text-slate-800',
  'OH/DA Pending': 'bg-purple-100 text-purple-800',
  'Closure Pending': 'bg-pink-100 text-pink-800',
};

const priorityColors: Record<CasePriority, string> = {
  'P0': 'bg-red-200 text-red-900 font-bold',
  'P1': 'bg-orange-200 text-orange-900 font-semibold',
  'P2': 'bg-yellow-200 text-yellow-900',
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Resident</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Account ID</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Client</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Reason</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Priority</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Status</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Assignee</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Queue Age</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700">Due Date</th>
            <th className="px-6 py-3 text-left font-semibold text-slate-700"></th>
          </tr>
        </thead>
        <tbody>
          {filteredCases.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
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
                  className={`border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors ${
                    overdue ? 'bg-red-50' : ''
                  }`}
                  onClick={() => onSelectCase(reviewCase.id)}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {reviewCase.residentName}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                    {reviewCase.accountId}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{reviewCase.client}</td>
                  <td className="px-6 py-4 text-slate-700">
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
                  <td className="px-6 py-4 text-slate-700">
                    {reviewCase.assignee || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {queueAge}d
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${ overdue ? 'text-red-700 font-semibold' : 'text-slate-700' }`}>
                    <div className="flex items-center gap-1">
                      {overdue && <AlertCircle className="w-4 h-4 text-red-600" />}
                      {formatDistanceToNow(reviewCase.dueDate, { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
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
