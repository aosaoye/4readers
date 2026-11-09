import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Wallet, WalletStatus } from '../types';

export function useChangeWalletStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: WalletStatus }) =>
      api.patch<Wallet>(`/wallet/admin/users/${userId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminUsers });
    },
  });
}
