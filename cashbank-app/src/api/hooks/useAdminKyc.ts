import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { AdminKycItem, KycStatus } from '../types';
import { asArray } from './usePaged';

export const useAdminKyc = (status: KycStatus, enabled = true) =>
  useQuery({
    queryKey: qk.adminKyc(status),
    queryFn: async () =>
      (await api.page<AdminKycItem>('/payouts/admin/kyc', { page: 1, limit: 50, kycStatus: status })).items,
    select: (data) => asArray<AdminKycItem>(data),
    enabled,
  });
