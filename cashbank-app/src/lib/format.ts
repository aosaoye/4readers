import type { KycStatus, WithdrawalStatus, OrderStatus, PostStatus, TransactionType, UserRole, VerificationStatus } from '@/api/types';

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const formatRelativeDate = (iso?: string | null) => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return formatDate(iso);
};

export const readingMinutes = (content?: string | null) => {
  const words = content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.ceil(words / 180));
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatMoney = (amount: string | number, currency = 'USD') => {
  try { return new Intl.NumberFormat('es', { style: 'currency', currency: currency.toUpperCase() }).format(Number(amount)); }
  catch { return `${amount} ${currency}`; }
};

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export type Tone = 'neutral' | 'accent' | 'success' | 'warn' | 'danger';

export const postStatusLabel: Record<PostStatus, [string, Tone]> = {
  DRAFT: ['Borrador', 'neutral'], IN_REVIEW: ['En revisión', 'warn'], PUBLISHED: ['Publicado', 'success'],
  REJECTED: ['Rechazado', 'danger'], ARCHIVED: ['Archivado', 'neutral'],
};
export const verificationLabel: Record<VerificationStatus, [string, Tone]> = {
  UNVERIFIED: ['Sin verificar', 'neutral'], PENDING: ['En revisión', 'warn'], VERIFIED: ['Verificado', 'success'],
  FAKE_REJECTED: ['Rechazado', 'danger'], NEEDS_CLARIFICATION: ['Requiere aclaración', 'warn'],
};
export const orderStatusLabel: Record<OrderStatus, [string, Tone]> = {
  PENDING: ['Pendiente', 'warn'], PAID: ['Pagado', 'success'], FAILED: ['Fallido', 'danger'], CANCELLED: ['Cancelado', 'neutral'],
};
export const txLabel: Record<TransactionType, string> = {
  CREDIT_PURCHASE: 'Compra de fichas', DEBIT_POST: 'Publicación', DEBIT_VERIFICATION: 'Verificación de artículo',
  TIP_SENT: 'Propina enviada', TIP_RECEIVED: 'Propina recibida', REVIEW_REWARD: 'Recompensa por revisión',
  WITHDRAWAL_HOLD: 'Retiro solicitado', WITHDRAWAL_REFUND: 'Retiro devuelto', REFUND_POST: 'Reembolso', BONUS: 'Bonificación',
};
export const roleLabel: Record<UserRole, string> = { USER: 'Autor', MODERATOR: 'Moderador', ADMIN: 'Administrador' };

export const withdrawalLabel: Record<WithdrawalStatus, [string, Tone]> = {
  PENDING: ['En revisión', 'warn'], APPROVED: ['Aprobado', 'accent'], PAID: ['Pagado', 'success'],
  REJECTED: ['Rechazado', 'danger'], CANCELLED: ['Cancelado', 'neutral'],
};
export const kycLabel: Record<KycStatus, [string, Tone]> = {
  NOT_STARTED: ['Sin verificar', 'neutral'], PENDING: ['En revisión', 'warn'], APPROVED: ['Verificada', 'success'], REJECTED: ['Rechazada', 'danger'],
};
