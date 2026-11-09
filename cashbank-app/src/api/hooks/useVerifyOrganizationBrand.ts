import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Organization } from '../types';

export function useVerifyOrganizationBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerifiedBrand }: { id: string; isVerifiedBrand: boolean }) =>
      api.patch<Organization>(`/organizations/admin/${id}/verify-brand`, { isVerifiedBrand }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganizations });
      qc.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
