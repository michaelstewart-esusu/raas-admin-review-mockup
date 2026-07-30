import React from 'react';

interface ConfirmCloseModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmCloseModal: React.FC<ConfirmCloseModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-esusu-teal/45 backdrop-blur-[1px] flex items-center justify-center z-[90] p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-panel max-w-md w-full p-6 border border-esusu-gray-border"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="close-case-title"
        aria-describedby="close-case-description"
      >
        <p className="ac-section-title mb-1">Confirm close</p>
        <h2 id="close-case-title" className="text-lg font-semibold text-esusu-ink mb-2">
          Are you sure?
        </h2>
        <p id="close-case-description" className="text-sm text-esusu-ink-muted mb-6">
          Closing the case will remove the account from the queue.
        </p>
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onCancel} className="ac-btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="ac-btn-danger">
            Yes, close case
          </button>
        </div>
      </div>
    </div>
  );
};
