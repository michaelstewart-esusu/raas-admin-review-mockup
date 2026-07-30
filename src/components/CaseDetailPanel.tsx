import React, { useEffect, useState } from 'react';
import { ReviewCase, CaseStatus } from '../types';
import { getReasonLabel } from '../data/reasonLabels';
import { ConfirmCloseModal } from './ConfirmCloseModal';
import { X, ExternalLink, History, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CaseDetailPanelProps {
  reviewCase: ReviewCase | null;
  onClose: () => void;
  onStatusChange: (caseId: string, newStatus: CaseStatus) => void;
  onAssigneeChange: (caseId: string, newAssignee: string) => void;
  onAddNote: (caseId: string, note: string) => void;
  onShowHistory: () => void;
  reviewers: string[];
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

export const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({
  reviewCase,
  onClose,
  onStatusChange,
  onAssigneeChange,
  onAddNote,
  onShowHistory,
  reviewers,
}) => {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    setNoteDraft('');
    setConfirmCloseOpen(false);
  }, [reviewCase?.id]);

  if (!reviewCase) return null;

  const handleStatusSelect = (status: CaseStatus) => {
    if (status === 'Closed') {
      setConfirmCloseOpen(true);
      return;
    }
    onStatusChange(reviewCase.id, status);
  };

  const handleAddNote = () => {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    onAddNote(reviewCase.id, trimmed);
    setNoteDraft('');
  };

  const notes = reviewCase.notes ?? [];

  return (
    <>
      {/* Backdrop — click outside closes the drawer */}
      <div
        className="fixed inset-0 bg-black/20 z-[60]"
        onClick={() => {
          if (!confirmCloseOpen) onClose();
        }}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 w-96 bg-white border-l border-esusu-gray-border shadow-lg overflow-y-auto z-[70]"
        role="dialog"
        aria-modal="true"
        aria-label="Case details"
      >
        {/* Header */}
        <div className="sticky top-0 bg-esusu-gray-light border-b border-esusu-gray-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Case Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resident Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resident</h3>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-bold text-gray-900">{reviewCase.residentName}</p>
                <p className="text-sm font-mono text-gray-600">{reviewCase.accountId}</p>
              </div>
              <p className="text-sm text-gray-600">{reviewCase.client}</p>
              {reviewCase.property && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{reviewCase.property}</span>
                </div>
              )}
            </div>
          </div>

          {/* Review Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Review Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reason:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getReasonLabel(reviewCase.reason)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Priority:</span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  reviewCase.priority === 'P0' ? 'bg-red-200 text-red-900' :
                  reviewCase.priority === 'P1' ? 'bg-orange-200 text-orange-900' :
                  'bg-yellow-200 text-yellow-900'
                }`}>
                  {reviewCase.priority}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Type:</span>
                <span className="text-sm font-medium text-gray-900">{reviewCase.paymentType || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reporting State:</span>
                <span className="text-sm font-medium text-gray-900">{reviewCase.reportingState || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Prior Reviews:</span>
                <span className="text-sm font-medium text-gray-900">{reviewCase.priorReviewCount}</span>
              </div>
            </div>
          </div>

          {/* Status & Assignment */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status & Assignment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Status</label>
                <select
                  value={reviewCase.status}
                  onChange={(e) => handleStatusSelect(e.target.value as CaseStatus)}
                  className={`w-full px-3 py-2 border border-esusu-gray-border rounded text-sm font-medium ${
                    statusColors[reviewCase.status]
                  } cursor-pointer`}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Review">In Review</option>
                  <option value="Waiting for Verification">Waiting for Verification</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Done">Done</option>
                  <option value="Closed">Closed</option>
                  <option value="OH/DA Pending">OH/DA Pending</option>
                  <option value="Closure Pending">Closure Pending</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Assignee</label>
                <select
                  value={reviewCase.assignee || ''}
                  onChange={(e) => onAssigneeChange(reviewCase.id, e.target.value)}
                  className="w-full px-3 py-2 border border-esusu-gray-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-esusu-green"
                >
                  <option value="">Unassigned</option>
                  {reviewers.map((reviewer) => (
                    <option key={reviewer} value={reviewer}>
                      {reviewer}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
            {notes.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {notes.map((note, idx) => (
                  <li
                    key={`${idx}-${note.slice(0, 12)}`}
                    className="text-sm text-gray-800 bg-esusu-gray-light border border-esusu-gray-border rounded px-3 py-2 whitespace-pre-wrap"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No notes yet.</p>
            )}
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 border border-esusu-gray-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-esusu-green resize-y"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={!noteDraft.trim()}
              className="mt-2 w-full px-4 py-2 bg-esusu-green text-white rounded text-sm font-medium hover:bg-esusu-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add note
            </button>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  {formatDistanceToNow(reviewCase.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Due</p>
                <p className="font-medium text-gray-900">
                  {formatDistanceToNow(reviewCase.dueDate, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Deep Link */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions</h3>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-esusu-green text-white rounded hover:bg-esusu-green/90 transition-colors text-sm font-medium">
              <ExternalLink className="w-4 h-4" />
              View in Residents Console
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={onShowHistory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-esusu-gray-border text-gray-700 rounded hover:bg-esusu-gray-light transition-colors text-sm font-medium"
          >
            <History className="w-4 h-4" />
            View Account History
          </button>
        </div>
      </div>

      <ConfirmCloseModal
        open={confirmCloseOpen}
        onCancel={() => setConfirmCloseOpen(false)}
        onConfirm={() => {
          setConfirmCloseOpen(false);
          onStatusChange(reviewCase.id, 'Closed');
        }}
      />
    </>
  );
};
