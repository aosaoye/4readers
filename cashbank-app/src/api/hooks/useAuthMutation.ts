import { useMutation, useQueryClient } from '@tanstack/react-query';
import { session } from '@/lib/session';
import { api } from '../client';
import { qk } from '../keys';
import type { AuthResponse } from '../types';

export function useAuthMutation<I>(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: I) => api.publicPost<AuthResponse>(path, input),
    onSuccess: async (res) => {
      qc.clear(); // por si quedaba algo de otra cuenta
      qc.setQueryData(qk.me, res.user); // el perfil ya viene en la respuesta: cero peticiones extra
      await session.setTokens(res);
    },
  });
}
