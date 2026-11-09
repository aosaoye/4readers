import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { qk } from '../keys';
import type { Category, CreateCategoryInput } from '../types';

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.post<Category>('/blog/admin/categories', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.categories });
    },
  });
}
