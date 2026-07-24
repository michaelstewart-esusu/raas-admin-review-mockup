import React from 'react';
import { CaseStatus, CasePriority } from '../types';
import { Search } from 'lucide-react';

interface QueueFiltersProps {
  statuses: CaseStatus[];
  priorities: CasePriority[];
  assignees: string[];
  clients: string[];
  onStatusChange: (status: CaseStatus | '') => void;
  onAssigneeChange: (assignee: string) => void;
  onPriorityChange: (priority: CasePriority | '') => void;
  onClientChange: (client: string) => void;
  onSearchChange?: (search: string) => void;
}

export const QueueFilters: React.FC<QueueFiltersProps> = ({
  statuses,
  priorities,
  assignees,
  clients,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  onClientChange,
  onSearchChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Name or ID..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
          <select
            onChange={(e) => onStatusChange(e.target.value as CaseStatus | '')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
          <select
            onChange={(e) => onPriorityChange(e.target.value as CasePriority | '')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
          <select
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        {/* Client Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
          <select
            onChange={(e) => onClientChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
