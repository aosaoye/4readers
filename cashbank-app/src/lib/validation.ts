/** Espejo de las reglas del backend: el usuario ve el error al instante, sin viajar al servidor. */
export type Errors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const len = (v: string, label: string, min: number, max: number) =>
  v.trim().length < min ? `${label} debe tener al menos ${min} caracteres.`
  : v.trim().length > max ? `${label} no puede superar ${max} caracteres.` : undefined;

export const rules = {
  email: (v: string) => (EMAIL.test(v.trim()) ? undefined : 'Ingresa un correo válido, por ejemplo usuario@dominio.com.'),
  loginPassword: (v: string) => (v.length >= 8 ? undefined : 'La contraseña tiene al menos 8 caracteres.'),
  username: (v: string) =>
    !/^[a-zA-Z0-9_]+$/.test(v) ? 'Solo letras, números y guion bajo (_), sin espacios.' : len(v, 'El usuario', 3, 30),
  strongPassword: (v: string) =>
    STRONG.test(v) ? undefined : 'Usa 8 o más caracteres con mayúscula, minúscula, número y símbolo.',
  title: (v: string) => len(v, 'El título', 10, 180),
  summary: (v: string) => len(v, 'El resumen', 20, 350),
  content: (v: string) => len(v, 'El contenido', 50, 50_000),
  category: (v: string) => (UUID.test(v) ? undefined : 'Elige una categoría.'),
  sourceTitle: (v: string) => len(v, 'El título de la fuente', 3, 180),
  sourceUrl: (v: string) => (/^https:\/\/[^\s]+\.[^\s]+$/i.test(v.trim()) ? undefined : 'Debe ser un enlace que empiece con https://'),
  publisher: (v: string) => len(v, 'El medio', 2, 120),
  notes: (v: string) => len(v, 'Las notas', 10, 2000),
};

export const hasErrors = (e: Record<string, unknown>) => Object.values(e).some(Boolean);
