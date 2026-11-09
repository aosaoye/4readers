import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { UpdateMyProfileInput, UserProfile } from '../types';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMyProfileInput) => api.patch<UserProfile>('/users/me/profile', body),
    onSuccess: (user) => {
      qc.setQueryData(qk.me, user);
      if (user.username) {
        qc.invalidateQueries({ queryKey: qk.author(user.username) });
      }
    },
  });
}
