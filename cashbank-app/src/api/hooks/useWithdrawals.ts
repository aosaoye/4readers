import { qk } from '../keys';
import type { Withdrawal } from '../types';
import { usePaged } from './usePaged';

export const useWithdrawals = () => usePaged<Withdrawal>(qk.withdrawals, '/payouts/me/withdrawals', {});
