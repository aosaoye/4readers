import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ updated: number }>('/users/me/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}
