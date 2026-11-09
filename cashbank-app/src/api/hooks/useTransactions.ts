import { qk } from '../keys';
import type { WalletTransaction } from '../types';
import { usePaged } from './usePaged';

export const useTransactions = (type: string | null) =>
  usePaged<WalletTransaction>(qk.transactions(type), '/wallet/me/transactions', { type });
