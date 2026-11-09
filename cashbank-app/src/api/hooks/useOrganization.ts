import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Organization } from '../types';

export const useOrganization = (slug: string) =>
  useQuery({
    queryKey: qk.organization(slug),
    queryFn: () => api.get<Organization>(`/organizations/${encodeURIComponent(slug)}`, { auth: false }),
    enabled: !!slug,
  });
