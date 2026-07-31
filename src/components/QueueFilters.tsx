import React from 'react';
import { CaseStatus, CasePriority } from '../types';
import { Search } from 'lucide-react';
import { MultiSelect } from './MultiSelect';

export const UNASSIGNED_ASSIGNEE = '__unassigned__';

interface QueueFiltersProps {
  statuses: CaseStatus[];
  priorities: CasePriority[];
  assignees: string[];
  clients: string[];
  selectedStatuses: CaseStatus[];
  selectedPriorities: CasePriority[];
  selectedAssignees: string[];
  selectedClients: string[];
  onStatusesChange: (statuses: CaseStatus[]) => void;
  onPrioritiesChange: (priorities: CasePriority[]) => void;
  onAssigneesChange: (assignees: string[]) => void;
  onClientsChange: (clients: string[]) => void;
  onSearchChange?: (search: string) => void;
}

export const QueueFilters: React.FC<QueueFiltersProps> = ({
  statuses,
  priorities,
  assignees,
  clients,
  selectedStatuses,
  selectedPriorities,
  selectedAssignees,
  selectedClients,
  onStatusesChange,
  onPrioritiesChange,
  onAssigneesChange,
  onClientsChange,
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

        <MultiSelect
          label="Status"
          placeholder="All Statuses"
          options={statuses.map((status) => ({ value: status, label: status }))}
          selected={selectedStatuses}
          onChange={(next) => onStatusesChange(next as CaseStatus[])}
        />

        <MultiSelect
          label="Priority"
          placeholder="All Priorities"
          options={priorities.map((priority) => ({ value: priority, label: priority }))}
          selected={selectedPriorities}
          onChange={(next) => onPrioritiesChange(next as CasePriority[])}
        />

        <MultiSelect
          label="Assignee"
          placeholder="All Assignees"
          options={[
            { value: UNASSIGNED_ASSIGNEE, label: 'Unassigned' },
            ...assignees.map((assignee) => ({ value: assignee, label: assignee })),
          ]}
          selected={selectedAssignees}
          onChange={onAssigneesChange}
        />

        <MultiSelect
          label="Client"
          placeholder="All Clients"
          options={clients.map((client) => ({ value: client, label: client }))}
          selected={selectedClients}
          onChange={onClientsChange}
        />
      </div>
    </div>
  );
};
