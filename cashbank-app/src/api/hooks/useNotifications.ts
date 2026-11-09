import { qk } from '../keys';
import type { NotificationItem } from '../types';
import { usePaged } from './usePaged';

export const useNotifications = () =>
  usePaged<NotificationItem>(qk.notifications, '/users/me/notifications');
