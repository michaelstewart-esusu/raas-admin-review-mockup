import React from 'react';
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
    { label: 'Escalated', filters: { status: 'Escalated' as CaseStatus } },
    { label: 'Overdue', filters: { isOverdue: true } },
    { label: 'P0 Priority', filters: { priority: 'P0' as CasePriority } },
    { label: 'OH/DA Needed', filters: { status: 'OH/DA Pending' as CaseStatus } },
    { label: 'Closure Needed', filters: { status: 'Closure Pending' as CaseStatus } },
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Saved Views</h3>
      <div className="flex flex-wrap gap-2">
        {views.map((view) => (
          <button
            key={view.label}
            onClick={() => onViewSelect(view.filters)}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
};
