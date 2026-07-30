import { ReviewReason } from '../types';

export const reasonLabels: Record<ReviewReason, string> = {
  p2p_deviation: 'P2P Deviation',
  no_user_labels: 'No User Labels',
  competing_product: 'Competing Product',
  no_admin_labels_new: 'No Admin Labels (New)',
  transaction_deviation_non_p2p: 'Non-P2P Transaction Deviation',
  ai_label_conflict: 'AI Label Conflict',
  no_admin_labels_old: 'No Admin Labels (Old)',
  vantage_review_48h: 'Vantage Review (48h+)',
  vantage_review_0_48h: 'Vantage Review (0–48h)',
};

export function getReasonLabel(reason: string): string {
  return reasonLabels[reason as ReviewReason] || reason;
}
