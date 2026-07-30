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
    <div className="bg-white px-4 py-3.5 rounded-lg border border-esusu-gray-border shadow-panel">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="ac-label">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-esusu-ink-subtle" />
            <input
              type="text"
              placeholder="Name or account ID..."
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="ac-input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="ac-label">Status</label>
          <select
            onChange={(e) => onStatusChange(e.target.value as CaseStatus | '')}
            className="ac-input"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ac-label">Priority</label>
          <select
            onChange={(e) => onPriorityChange(e.target.value as CasePriority | '')}
            className="ac-input"
          >
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ac-label">Assignee</label>
          <select onChange={(e) => onAssigneeChange(e.target.value)} className="ac-input">
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="ac-label">Client</label>
          <select onChange={(e) => onClientChange(e.target.value)} className="ac-input">
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
