import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import type { KycStatus } from '../types';

export function useReviewKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status, reference }: { userId: string; status: 'APPROVED' | 'REJECTED'; reference?: string }) =>
      api.patch<{ kycStatus: KycStatus }>(`/payouts/admin/kyc/${userId}`, { status, reference }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      qc.invalidateQueries({ queryKey: ['payouts'] });
    },
  });
}
