// lib/url.ts - Utilitário para URLs da API (igual ao cursor)
const base = process.env.NEXT_PUBLIC_API_URL || '/api';

export function apiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${cleanPath}`;
}



