import type { Post } from '@/api/types';

/** Acepta el prefijo actual ("Compartido de") y el antiguo ("Republicado de") para no romper publicaciones previas. */
const REPOST_PREFIX_RE = /^(?:Compartido|Republicado) de @([a-zA-Z0-9_]+)\s+[—-]\s+/;

/**
 * Codifica el propietario/autor original al inicio del resumen respetando el límite de 350 caracteres del backend.
 */
export function formatRepostSummary(originalAuthor: string, summary: string): string {
  const clean = summary.replace(REPOST_PREFIX_RE, '').trim();
  const prefix = `Compartido de @${originalAuthor} — `;
  const maxCleanLen = Math.max(20, 350 - prefix.length);
  const clipped = clean.length > maxCleanLen ? `${clean.slice(0, maxCleanLen - 1).trimEnd()}…` : clean;
  return `${prefix}${clipped}`;
}

/**
 * Extrae el autor/propietario original y quién lo republicó a partir de un Post.
 */
export function parseRepost(post: Post): {
  isRepost: boolean;
  originalAuthor: string;
  repostedBy: string | null;
  cleanSummary: string;
} {
  const match = post.summary?.match(REPOST_PREFIX_RE);
  if (match) {
    const originalAuthor = match[1];
    const cleanSummary = post.summary.replace(REPOST_PREFIX_RE, '').trim();
    return {
      isRepost: true,
      originalAuthor,
      repostedBy: post.authorUsername ?? null,
      cleanSummary,
    };
  }
  return {
    isRepost: false,
    originalAuthor: post.authorUsername ?? 'Autor',
    repostedBy: null,
    cleanSummary: post.summary,
  };
}
