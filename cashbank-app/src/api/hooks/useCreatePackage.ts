import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { CreatePackageInput, TokenPackage } from '../types';

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePackageInput) => api.post<TokenPackage>('/store/admin/packages', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.adminPackages });
      qc.invalidateQueries({ queryKey: qk.packages });
    },
  });
}
