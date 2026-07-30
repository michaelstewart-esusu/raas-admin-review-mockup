import React from 'react';
import { CaseHistory } from '../types';
import { getReasonLabel } from '../data/reasonLabels';
import { X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AccountHistoryModalProps {
  history: CaseHistory | null;
  onClose: () => void;
}

export const AccountHistoryModal: React.FC<AccountHistoryModalProps> = ({
  history,
  onClose,
}) => {
  if (!history) return null;

  return (
    <div
      className="fixed inset-0 bg-esusu-teal/40 backdrop-blur-[1px] flex items-center justify-center z-[80] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-esusu-gray-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-esusu-gray-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="ac-section-title mb-0.5">Account History</p>
            <h2 className="text-lg font-semibold text-esusu-ink">{history.residentName}</h2>
            <p className="text-sm text-esusu-ink-muted font-mono">{history.accountId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-esusu-ink-muted hover:text-esusu-ink hover:bg-esusu-gray-light transition-colors"
            aria-label="Close account history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-7">
          <div>
            <h3 className="ac-section-title mb-3">Current Review</h3>
            <div className="border border-esusu-gray-border rounded-md p-4 bg-esusu-gray-light/60">
              <div className="flex items-start justify-between mb-2 gap-3">
                <p className="text-sm font-semibold text-esusu-ink">Active case</p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-esusu-ink-muted">
                  {history.currentStatus}
                </span>
              </div>
              <p className="text-sm text-esusu-ink-muted mt-2">
                Reason:{' '}
                <span className="font-medium text-esusu-ink">
                  {getReasonLabel(history.currentReason)}
                </span>
              </p>
              <p className="text-sm text-esusu-ink-muted">
                Assignee:{' '}
                <span className="font-medium text-esusu-ink">
                  {history.currentAssignee || 'Unassigned'}
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="ac-section-title mb-3">Prior Reviews</h3>
            {history.priorReviews.length === 0 ? (
              <p className="text-sm text-esusu-ink-subtle">No prior reviews on record.</p>
            ) : (
              <div className="space-y-3">
                {history.priorReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border border-esusu-gray-border rounded-md p-4 bg-esusu-gray-light/40"
                  >
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div>
                        <p className="text-sm font-semibold text-esusu-ink">
                          Review {idx + 1}
                        </p>
                        <p className="text-xs text-esusu-ink-muted flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(review.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-esusu-ink-muted">
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-esusu-ink-muted mt-2">
                      Reason:{' '}
                      <span className="font-medium text-esusu-ink">
                        {getReasonLabel(review.reason)}
                      </span>
                    </p>
                    <p className="text-sm text-esusu-ink-muted">
                      Assignee:{' '}
                      <span className="font-medium text-esusu-ink">
                        {review.assignee || 'Unassigned'}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="ac-section-title mb-3">State History</h3>
            {history.stateHistory.length === 0 ? (
              <p className="text-sm text-esusu-ink-subtle">No state changes on record.</p>
            ) : (
              <div className="space-y-2.5">
                {history.stateHistory.map((transition, idx) => {
                  const kindLabel =
                    transition.kind === 'status'
                      ? 'Status'
                      : transition.kind === 'assignee'
                        ? 'Assignee'
                        : 'Note';

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm border-b border-esusu-gray-border last:border-b-0 pb-2.5 last:pb-0"
                    >
                      <div className="w-24 text-esusu-ink-subtle font-medium text-xs pt-0.5 shrink-0">
                        {format(transition.timestamp, 'MMM d, yyyy')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-esusu-green-light text-esusu-teal mr-2">
                          {kindLabel}
                        </span>
                        {transition.kind === 'note' ? (
                          <span className="text-esusu-ink whitespace-pre-wrap">
                            {transition.toState}
                          </span>
                        ) : (
                          <span className="text-esusu-ink">
                            {transition.fromState} → {transition.toState}
                          </span>
                        )}
                        <span className="text-esusu-ink-subtle ml-2 text-xs">
                          by {transition.actor}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h3 className="ac-section-title mb-3">Notes</h3>
            {history.notes.length === 0 ? (
              <p className="text-sm text-esusu-ink-subtle">No notes on record.</p>
            ) : (
              <ul className="space-y-2">
                {history.notes.map((note, idx) => (
                  <li
                    key={`${idx}-${note.slice(0, 12)}`}
                    className="text-sm text-esusu-ink border border-esusu-gray-border rounded-md p-3 bg-esusu-gray-light/50 whitespace-pre-wrap"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="ac-section-title mb-3">Audit Trail</h3>
            <div className="space-y-2">
              {history.auditTrail.slice(0, 10).map((entry, idx) => (
                <div
                  key={idx}
                  className="text-sm text-esusu-ink-muted pb-2.5 border-b border-esusu-gray-border last:border-b-0"
                >
                  <p className="font-semibold text-esusu-ink">{entry.action}</p>
                  <p className="text-xs text-esusu-ink-subtle mt-0.5">
                    {format(entry.timestamp, 'MMM d, yyyy h:mm a')} by {entry.actor}
                  </p>
                  {entry.prior && entry.current ? (
                    <p className="text-xs text-esusu-ink-muted mt-1">
                      {entry.prior} → {entry.current}
                    </p>
                  ) : entry.current ? (
                    <p className="text-xs text-esusu-ink-muted mt-1 whitespace-pre-wrap">
                      {entry.current}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
