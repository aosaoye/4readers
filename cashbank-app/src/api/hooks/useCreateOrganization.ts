import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { CreateOrganizationInput, Organization } from '../types';

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrganizationInput) => api.post<Organization>('/organizations', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganizations });
    },
  });
}
