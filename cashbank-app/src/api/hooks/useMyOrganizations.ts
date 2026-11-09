import { qk } from '../keys';
import type { Organization } from '../types';
import { usePaged } from './usePaged';

export const useMyOrganizations = () =>
  usePaged<Organization>(qk.myOrganizations, '/organizations/me');
