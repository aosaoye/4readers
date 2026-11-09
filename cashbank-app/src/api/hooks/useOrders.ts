import { qk } from '../keys';
import type { StoreOrder } from '../types';
import { asArray, usePaged } from './usePaged';

/** Mientras haya una compra PENDING reciente, consulta cada 4 s (el webhook de Stripe tarda unos segundos). */
export const useOrders = () =>
  usePaged<StoreOrder>(
    qk.orders,
    '/store/orders/me',
    {},
    {
      poll: (pages) =>
        pages.some((p) =>
          asArray<StoreOrder>(p?.items ?? p).some(
            (o: StoreOrder) => o.status === 'PENDING' && Date.now() - new Date(o.createdAt).getTime() < 30 * 60_000,
          ),
        )
          ? 4_000
          : false,
    },
  );
