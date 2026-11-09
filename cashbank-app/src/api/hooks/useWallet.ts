import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Wallet } from '../types';

export const useWallet = () =>
  useQuery({ queryKey: qk.wallet, queryFn: () => api.get<Wallet>('/wallet/me'), staleTime: 30_000 });
