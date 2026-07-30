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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="close-case-title"
        aria-describedby="close-case-description"
      >
        <h2 id="close-case-title" className="text-lg font-semibold text-gray-900 mb-2">
          Are you sure?
        </h2>
        <p id="close-case-description" className="text-sm text-gray-600 mb-6">
          Closing the case will remove the account from the queue.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-esusu-gray-border rounded hover:bg-esusu-gray-light transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Yes, close case
          </button>
        </div>
      </div>
    </div>
  );
};
