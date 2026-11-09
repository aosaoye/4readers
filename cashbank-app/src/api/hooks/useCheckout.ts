import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import type { CheckoutSession } from '../types';

export const useCheckout = () =>
  useMutation({
    mutationFn: (v: { packageId: string; quantity: number }) => api.post<CheckoutSession>('/store/stripe/checkout', v),
  });
