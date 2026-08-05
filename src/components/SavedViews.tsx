import React, { useState } from 'react';
import { CaseStatus, CasePriority } from '../types';

interface SavedViewsProps {
  onViewSelect: (filters: {
    status?: CaseStatus;
    priority?: CasePriority;
    assignee?: string;
    isOverdue?: boolean;
  }) => void;
  currentAssignee?: string;
}

export const SavedViews: React.FC<SavedViewsProps> = ({ onViewSelect, currentAssignee }) => {
  const views = [
    { label: 'Unassigned', filters: { assignee: 'unassigned' } },
    { label: 'My Queue', filters: { assignee: currentAssignee || 'Alice Chen' } },
    {
      label: 'Awaiting Consumer Action',
      filters: { status: 'Awaiting Consumer Action' as CaseStatus },
    },
    { label: 'Overdue', filters: { isOverdue: true } },
    { label: 'P0 Priority', filters: { priority: 'P0' as CasePriority } },
    {
      label: 'Waiting for Verification',
      filters: { status: 'Waiting for Verification' as CaseStatus },
    },
    { label: 'Deleted', filters: { status: 'Deleted' as CaseStatus } },
  ];

  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="ac-section-title">Saved Views</h3>
      </div>
      <div className="flex flex-wrap gap-1.5 border-b border-esusu-gray-border pb-px">
        {views.map((view) => {
          const isActive = activeLabel === view.label;
          return (
            <button
              key={view.label}
              type="button"
              onClick={() => {
                setActiveLabel(view.label);
                onViewSelect(view.filters);
              }}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-esusu-green text-esusu-teal'
                  : 'border-transparent text-esusu-ink-muted hover:text-esusu-ink hover:border-esusu-gray-border'
              }`}
            >
              {view.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
