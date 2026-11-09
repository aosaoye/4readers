import { useAuthMutation } from './useAuthMutation';

export const useRegister = () =>
  useAuthMutation<{ email: string; username: string; password: string }>('/auth/register');
