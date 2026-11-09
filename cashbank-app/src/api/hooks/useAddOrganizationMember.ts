import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { AddOrganizationMemberInput, OrganizationMember } from '../types';

export function useAddOrganizationMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddOrganizationMemberInput) =>
      api.post<OrganizationMember>(`/organizations/${orgId}/members`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myOrganizations });
    },
  });
}
