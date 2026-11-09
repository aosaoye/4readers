import { API_URL, REQUEST_TIMEOUT_MS } from '@/config';
import { session } from '@/lib/session';
import type { AuthResponse, Page, PageMeta } from './types';

/** Error normalizado: la API ya devuelve mensajes seguros y en español, solo los conservamos. */
export class ApiError extends Error {
  status: number;
  code: string;
  details: string[];
  actionHint?: string;
  referenceId?: string;
  constructor(o: { status: number; code: string; message: string; details?: string[]; actionHint?: string; referenceId?: string }) {
    super(o.message);
    this.status = o.status;
    this.code = o.code;
    this.details = o.details ?? [];
    this.actionHint = o.actionHint;
    this.referenceId = o.referenceId;
  }
  get isNetwork() { return this.status === 0; }
}

type Params = Record<string, string | number | boolean | null | undefined>;
type Envelope = { success: boolean; data: unknown; meta?: PageMeta };
type Opts = { params?: Params; body?: unknown; auth?: boolean };

/** Desenvuelve respuestas anidadas si el backend envuelve `{ success, data }` varias veces. */
function unwrapEnvelope(raw: any): any {
  let cur = raw;
  let meta = raw?.meta;
  let referenceId = raw?.referenceId;
  while (
    cur &&
    typeof cur === 'object' &&
    !Array.isArray(cur) &&
    typeof cur.success === 'boolean' &&
    cur.data &&
    typeof cur.data === 'object' &&
    !Array.isArray(cur.data) &&
    typeof cur.data.success === 'boolean' &&
    ('data' in cur.data || 'code' in cur.data || 'message' in cur.data)
  ) {
    cur = cur.data;
    if (cur.meta !== undefined) meta = cur.meta;
    if (cur.referenceId !== undefined) referenceId = cur.referenceId;
  }
  if (cur && typeof cur === 'object' && !Array.isArray(cur)) {
    if (meta !== undefined && cur.meta === undefined) cur = { ...cur, meta };
    if (referenceId !== undefined && cur.referenceId === undefined) cur = { ...cur, referenceId };
  }
  return cur;
}

const qs = (p?: Params) => {
  if (!p) return '';
  const s = Object.entries(p)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return s ? `?${s}` : '';
};

async function send(method: string, path: string, body: unknown, auth: boolean): Promise<Envelope> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = auth ? session.getAccessToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method, headers, signal: ctrl.signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let json: any = null;
    try { json = unwrapEnvelope(await res.json()); } catch { /* cuerpo vacío o no JSON */ }

    if (!res.ok || json?.success === false) {
      throw new ApiError({
        status: res.status,
        code: json?.code ?? 'INTERNAL_ERROR',
        message: json?.message ?? 'No pudimos completar tu solicitud. Inténtalo de nuevo.',
        details: json?.details,
        actionHint: json?.actionHint,
        referenceId: json?.referenceId,
      });
    }
    return json as Envelope;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError({ status: 0, code: 'NETWORK', message: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.' });
  } finally {
    clearTimeout(timer);
  }
}

/** Renovación en "single-flight": si 5 peticiones fallan a la vez con 401, solo se hace 1 refresh. */
let refreshing: Promise<boolean> | null = null;
async function doRefresh(): Promise<boolean> {
  const rt = session.getRefreshToken();
  if (!rt) return false;
  try {
    const r = await send('POST', '/auth/refresh', { refreshToken: rt }, false);
    await session.setTokens(r.data as AuthResponse);
    return true;
  } catch (e) {
    // Refresh rechazado = sesión inválida. Un fallo de red NO cierra sesión.
    if (e instanceof ApiError && e.status >= 400 && e.status < 500) await session.clear();
    return false;
  }
}
function refreshTokens(): Promise<boolean> {
  refreshing ??= doRefresh().finally(() => { refreshing = null; });
  return refreshing;
}

async function request(method: string, path: string, { params, body, auth = true }: Opts = {}) {
  const url = path + qs(params);
  // Evita un viaje perdido: si el token está por caducar, se renueva antes de pedir.
  if (auth && session.getRefreshToken() && session.isAccessExpiring()) await refreshTokens();
  try {
    return await send(method, url, body, auth);
  } catch (e) {
    if (auth && e instanceof ApiError && e.status === 401) {
      if (session.getRefreshToken() && (await refreshTokens())) {
        return send(method, url, body, auth);
      }
      await session.clear();
    }
    throw e;
  }
}

export const api = {
  get: async <T,>(path: string, o?: Opts) => (await request('GET', path, o)).data as T,
  post: async <T,>(path: string, body?: unknown, o?: Omit<Opts, 'body'>) =>
    (await request('POST', path, { ...o, body: body ?? {} })).data as T,
  put: async <T,>(path: string, body: unknown) => (await request('PUT', path, { body })).data as T,
  patch: async <T,>(path: string, body?: unknown) => (await request('PATCH', path, { body: body ?? {} })).data as T,
  del: async <T,>(path: string, o?: Opts) => (await request('DELETE', path, o)).data as T,
  /** Listados: la API devuelve { data: items[], meta }. Lo juntamos en { items, meta }. */
  page: async <T,>(path: string, params?: Params, o?: Omit<Opts, 'params'>): Promise<Page<T>> => {
    const r = await request('GET', path, { ...o, params });
    const raw = r.data as any;
    const items: T[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : Array.isArray(raw?.data) ? raw.data : [];
    const rawMeta = (r.meta ?? raw?.meta ?? {}) as Partial<PageMeta>;
    const page = Number(rawMeta.page ?? params?.page ?? 1);
    const limit = Number(rawMeta.limit ?? params?.limit ?? (items.length || 10));
    const totalItems = Number(rawMeta.totalItems ?? items.length);
    const totalPages = Number(rawMeta.totalPages ?? (limit > 0 ? Math.max(1, Math.ceil(totalItems / limit)) : 1));
    const meta: PageMeta = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: rawMeta.hasNextPage ?? page < totalPages,
      hasPreviousPage: rawMeta.hasPreviousPage ?? page > 1,
    };
    return { items, meta };
  },
  /** Login/registro: sin token previo. */
  publicPost: <T,>(path: string, body: unknown) => api.post<T>(path, body, { auth: false }),
};
