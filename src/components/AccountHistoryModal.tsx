import React from 'react';
import { CaseHistory } from '../types';
import { X, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{history.residentName}</h2>
            <p className="text-sm text-slate-600 font-mono">{history.accountId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Prior Reviews */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Prior Reviews</h3>
            {history.priorReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No prior reviews on record.</p>
            ) : (
              <div className="space-y-3">
                {history.priorReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Review {idx + 1}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(review.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-2">
                      Reason: <span className="font-medium">{review.reason}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                      Assignee: <span className="font-medium">{review.assignee || 'Unassigned'}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* State History */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">State History</h3>
            <div className="space-y-2">
              {history.stateHistory.map((transition, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-24 text-slate-600 font-medium text-xs">
                    {format(transition.timestamp, 'MMM d, yyyy')}
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-900">
                      {transition.fromState} → {transition.toState}
                    </span>
                    <span className="text-slate-500 ml-2 text-xs">by {transition.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Audit Trail</h3>
            <div className="space-y-2">
              {history.auditTrail.slice(0, 10).map((entry, idx) => (
                <div key={idx} className="text-sm text-slate-700 pb-2 border-b border-slate-200">
                  <p className="font-medium text-slate-900">{entry.action}</p>
                  <p className="text-xs text-slate-600">
                    {format(entry.timestamp, 'MMM d, yyyy h:mm a')} by {entry.actor}
                  </p>
                  {entry.prior && entry.current && (
                    <p className="text-xs text-slate-600 mt-1">
                      {entry.prior} → {entry.current}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
