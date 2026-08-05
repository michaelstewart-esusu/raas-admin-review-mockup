import React, { useEffect, useState } from 'react';
import { ReviewCase, CaseStatus, ConsumerEmail, CASE_STATUSES } from '../types';
import { getReasonLabel } from '../data/reasonLabels';
import { ConfirmCloseModal } from './ConfirmCloseModal';
import {
  X,
  ExternalLink,
  History,
  MapPin,
  Mail,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CaseDetailPanelProps {
  reviewCase: ReviewCase | null;
  onClose: () => void;
  onStatusChange: (caseId: string, newStatus: CaseStatus) => void;
  onAssigneeChange: (caseId: string, newAssignee: string) => void;
  onAddNote: (caseId: string, note: string) => void;
  onSendEmail: (
    caseId: string,
    message: Pick<ConsumerEmail, 'to' | 'subject' | 'body'>
  ) => void;
  onShowHistory: () => void;
  reviewers: string[];
}

const statusColors: Record<CaseStatus, string> = {
  'New': 'bg-sky-50 text-sky-800',
  'Assigned': 'bg-esusu-gray-light text-esusu-ink',
  'In Review': 'bg-amber-50 text-amber-800',
  'Waiting for Verification': 'bg-orange-50 text-orange-800',
  'Done': 'bg-esusu-green-light text-esusu-teal',
  'Awaiting Consumer Action': 'bg-violet-50 text-violet-800',
  'Closed': 'bg-esusu-gray-light text-esusu-ink-muted',
  'Deleted': 'bg-red-50 text-red-700',
};

export const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({
  reviewCase,
  onClose,
  onStatusChange,
  onAssigneeChange,
  onAddNote,
  onSendEmail,
  onShowHistory,
  reviewers,
}) => {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    setNoteDraft('');
    setConfirmCloseOpen(false);
    setEmailComposerOpen(false);
    setEmailSubject('');
    setEmailBody('');
    setEmailSent(false);
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
  const emails = reviewCase.emails ?? [];
  const consumerEmail = reviewCase.consumerEmail ?? '';

  const handleSendEmail = () => {
    const subject = emailSubject.trim();
    const body = emailBody.trim();
    if (!consumerEmail || !subject || !body) return;

    onSendEmail(reviewCase.id, {
      to: consumerEmail,
      subject,
      body,
    });
    setEmailSubject('');
    setEmailBody('');
    setEmailComposerOpen(false);
    setEmailSent(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-esusu-teal/25 backdrop-blur-[1px] z-[60]"
        onClick={() => {
          if (!confirmCloseOpen) onClose();
        }}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-esusu-gray-border shadow-drawer overflow-y-auto z-[70]"
        role="dialog"
        aria-modal="true"
        aria-label="Case details"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-esusu-gray-border px-5 py-3.5 flex items-center justify-between z-10">
          <div>
            <p className="ac-section-title mb-0.5">Case Details</p>
            <h2 className="text-base font-semibold text-esusu-ink">{reviewCase.id}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-esusu-ink-muted hover:text-esusu-ink hover:bg-esusu-gray-light transition-colors"
            aria-label="Close case details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <h3 className="ac-section-title mb-3">Resident</h3>
            <div className="space-y-2">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-esusu-ink">
                  {reviewCase.residentName}
                </p>
                <p className="text-sm font-mono text-esusu-ink-muted mt-0.5">
                  {reviewCase.accountId}
                </p>
              </div>
              <p className="text-sm text-esusu-ink-muted">{reviewCase.client}</p>
              {consumerEmail && (
                <div className="flex items-center gap-2 text-sm text-esusu-ink-muted">
                  <Mail className="w-4 h-4 flex-shrink-0 text-esusu-green" />
                  <span>{consumerEmail}</span>
                </div>
              )}
              {reviewCase.property && (
                <div className="flex items-start gap-2 text-sm text-esusu-ink-muted">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-esusu-green" />
                  <span>{reviewCase.property}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-esusu-gray-border pt-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="ac-section-title">Consumer Communications</h3>
              {emails.length > 0 && (
                <span className="text-xs text-esusu-ink-subtle">
                  {emails.length} sent
                </span>
              )}
            </div>

            {emailSent && (
              <div
                className="mb-3 flex items-center gap-2 rounded-md border border-esusu-green-muted bg-esusu-green-light px-3 py-2 text-sm text-esusu-teal"
                role="status"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Email sent and tracked in Account History.
              </div>
            )}

            {!emailComposerOpen ? (
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmailComposerOpen(true);
                  setEmailSubject(`Update regarding account ${reviewCase.accountId}`);
                }}
                className="ac-btn-secondary w-full"
                disabled={!consumerEmail}
              >
                <Mail className="w-4 h-4" />
                Email consumer
              </button>
            ) : (
              <div className="space-y-3 rounded-md border border-esusu-gray-border bg-esusu-gray-light/40 p-3">
                <p className="text-xs text-esusu-ink-subtle">
                  Delivery is simulated in this mockup and tracked for this session.
                </p>
                <div>
                  <label className="ac-label">To</label>
                  <input
                    type="email"
                    value={consumerEmail}
                    readOnly
                    className="ac-input bg-esusu-gray-light text-esusu-ink-muted"
                  />
                </div>
                <div>
                  <label className="ac-label">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                    className="ac-input"
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="ac-label">Message</label>
                  <textarea
                    value={emailBody}
                    onChange={(event) => setEmailBody(event.target.value)}
                    className="ac-input resize-y"
                    rows={5}
                    placeholder={`Hi ${reviewCase.residentName},\n\nEnter your message...`}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailComposerOpen(false);
                      setEmailSubject('');
                      setEmailBody('');
                    }}
                    className="ac-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={!emailSubject.trim() || !emailBody.trim()}
                    className="ac-btn-primary"
                  >
                    <Send className="w-4 h-4" />
                    Send email
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-esusu-gray-border pt-5">
            <h3 className="ac-section-title mb-3">Review Information</h3>
            <dl className="space-y-2.5">
              <div className="flex justify-between items-center gap-3">
                <dt className="text-sm text-esusu-ink-muted">Reason</dt>
                <dd className="text-sm font-medium text-esusu-ink text-right">
                  {getReasonLabel(reviewCase.reason)}
                </dd>
              </div>
              <div className="flex justify-between items-center gap-3">
                <dt className="text-sm text-esusu-ink-muted">Tier</dt>
                <dd>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset ${
                    reviewCase.priority === 'Tier 1' ? 'bg-red-100 text-red-800 ring-red-200' :
                    reviewCase.priority === 'Tier 2' ? 'bg-orange-100 text-orange-800 ring-orange-200' :
                    reviewCase.priority === 'Tier 3' ? 'bg-amber-100 text-amber-800 ring-amber-200' :
                    'bg-esusu-green-light text-esusu-teal ring-esusu-green-muted'
                  }`}>
                    {reviewCase.priority}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between items-center gap-3">
                <dt className="text-sm text-esusu-ink-muted">Payment Type</dt>
                <dd className="text-sm font-medium text-esusu-ink">{reviewCase.paymentType || '—'}</dd>
              </div>
              <div className="flex justify-between items-center gap-3">
                <dt className="text-sm text-esusu-ink-muted">Reporting State</dt>
                <dd className="text-sm font-medium text-esusu-ink">{reviewCase.reportingState || '—'}</dd>
              </div>
              <div className="flex justify-between items-center gap-3">
                <dt className="text-sm text-esusu-ink-muted">Prior Reviews</dt>
                <dd className="text-sm font-medium text-esusu-ink">{reviewCase.priorReviewCount}</dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-esusu-gray-border pt-5">
            <h3 className="ac-section-title mb-3">Status & Assignment</h3>
            <div className="space-y-3">
              <div>
                <label className="ac-label">Status</label>
                <select
                  value={reviewCase.status}
                  onChange={(e) => handleStatusSelect(e.target.value as CaseStatus)}
                  className={`ac-input font-medium ${statusColors[reviewCase.status]}`}
                >
                  {CASE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ac-label">Assignee</label>
                <select
                  value={reviewCase.assignee || ''}
                  onChange={(e) => onAssigneeChange(reviewCase.id, e.target.value)}
                  className="ac-input"
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

          <div className="border-t border-esusu-gray-border pt-5">
            <h3 className="ac-section-title mb-3">Notes</h3>
            {notes.length > 0 ? (
              <ul className="space-y-2 mb-3">
                {notes.map((note, idx) => (
                  <li
                    key={`${idx}-${note.slice(0, 12)}`}
                    className="text-sm text-esusu-ink bg-esusu-gray-light border border-esusu-gray-border rounded-md px-3 py-2 whitespace-pre-wrap"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-esusu-ink-subtle mb-3">No notes yet.</p>
            )}
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="ac-input resize-y"
            />
            <button
              type="button"
              onClick={handleAddNote}
              disabled={!noteDraft.trim()}
              className="ac-btn-primary mt-2 w-full"
            >
              Add note
            </button>
          </div>

          <div className="border-t border-esusu-gray-border pt-5">
            <h3 className="ac-section-title mb-3">Timeline</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-esusu-gray-border bg-esusu-gray-light/60 px-3 py-2.5">
                <p className="text-esusu-ink-muted text-xs mb-1">Created</p>
                <p className="font-medium text-esusu-ink">
                  {formatDistanceToNow(reviewCase.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div className="rounded-md border border-esusu-gray-border bg-esusu-gray-light/60 px-3 py-2.5">
                <p className="text-esusu-ink-muted text-xs mb-1">Due</p>
                <p className="font-medium text-esusu-ink">
                  {formatDistanceToNow(reviewCase.dueDate, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-esusu-gray-border pt-5 space-y-2.5">
            <h3 className="ac-section-title mb-1">Actions</h3>
            <button type="button" className="ac-btn-primary w-full">
              <ExternalLink className="w-4 h-4" />
              View in Residents Console
            </button>
            <button type="button" onClick={onShowHistory} className="ac-btn-secondary w-full">
              <History className="w-4 h-4" />
              View Account History
            </button>
          </div>
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
