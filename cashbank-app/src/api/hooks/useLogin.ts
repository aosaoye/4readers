import { useAuthMutation } from './useAuthMutation';

export const useLogin = () => useAuthMutation<{ email: string; password: string }>('/auth/login');
