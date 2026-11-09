import { session } from '@/lib/session';

export const logout = () => session.clear();
