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
  hideClosedAndDone: boolean;
  onStatusesChange: (statuses: CaseStatus[]) => void;
  onPrioritiesChange: (priorities: CasePriority[]) => void;
  onAssigneesChange: (assignees: string[]) => void;
  onClientsChange: (clients: string[]) => void;
  onHideClosedAndDoneChange: (hide: boolean) => void;
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
  hideClosedAndDone,
  onStatusesChange,
  onPrioritiesChange,
  onAssigneesChange,
  onClientsChange,
  onHideClosedAndDoneChange,
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

      <div className="mt-3 pt-3 border-t border-esusu-gray-border">
        <label className="inline-flex items-center gap-2.5 text-sm text-esusu-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideClosedAndDone}
            onChange={(e) => onHideClosedAndDoneChange(e.target.checked)}
            className="w-4 h-4 rounded border-esusu-gray-border text-esusu-green focus:ring-esusu-green/30 accent-esusu-green"
          />
          <span>
            Hide Closed and Done
            <span className="block text-xs text-esusu-ink-subtle font-normal">
              Explicitly selected Closed/Done statuses still appear
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};
