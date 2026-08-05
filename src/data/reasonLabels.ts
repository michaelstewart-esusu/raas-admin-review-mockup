import { CasePriority, ReviewReason } from '../types';

export const reasonLabels: Record<ReviewReason, string> = {
  p2p_deviation: 'P2P rent deviation',
  competing_product: 'Competing product',
  no_user_labels: 'Missing user labels',
  transaction_deviation_non_p2p: 'Non-P2P rent deviation',
  ai_label_conflict: 'AI/user label conflict',
  no_admin_labels: 'Missing admin labels',
  plaid_disconnected: 'Plaid disconnected',
  ai_transaction_deviation: 'AI rent deviation',
  regular_payment: 'Regular rent match',
};

export const reasonTiers: Record<ReviewReason, CasePriority> = {
  p2p_deviation: 'Tier 1',
  competing_product: 'Tier 1',
  no_user_labels: 'Tier 1',
  transaction_deviation_non_p2p: 'Tier 2',
  ai_label_conflict: 'Tier 2',
  no_admin_labels: 'Tier 2',
  plaid_disconnected: 'Tier 2',
  ai_transaction_deviation: 'Tier 3',
  regular_payment: 'Tier 4',
};

export function getReasonLabel(reason: string): string {
  return reasonLabels[reason as ReviewReason] || reason;
}
