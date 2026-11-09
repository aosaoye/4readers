import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { NotificationItem } from '../types';

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<NotificationItem>(`/users/me/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications });
    },
  });
}
