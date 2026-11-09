import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { GrantBonusInput, Wallet } from '../types';

export function useGrantBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GrantBonusInput) => api.post<Wallet>('/wallet/admin/bonus', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUsers });
      qc.invalidateQueries({ queryKey: qk.wallet });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}
