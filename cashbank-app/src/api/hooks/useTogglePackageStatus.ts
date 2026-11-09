import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { TokenPackage } from '../types';

export function useTogglePackageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<TokenPackage>(`/store/admin/packages/${id}/status`, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminPackages });
      qc.invalidateQueries({ queryKey: qk.packages });
    },
  });
}
