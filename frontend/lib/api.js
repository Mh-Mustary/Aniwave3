// frontend/lib/api.js
// Central API client — all fetch calls go through here

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aw_token') : null;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Songs & Radio
  getSongs: (params = {}) => apiFetch('/api/songs?' + new URLSearchParams(params)),
  getHistory: () => apiFetch('/api/songs/history'),
  addSong: (data) => apiFetch('/api/songs', { method: 'POST', body: JSON.stringify(data) }),

  // Articles
  getArticles: (params = {}) => apiFetch('/api/articles?' + new URLSearchParams(params)),
  getArticle: (slug) => apiFetch(`/api/articles/${slug}`),
  createArticle: (data) => apiFetch('/api/articles', { method: 'POST', body: JSON.stringify(data) }),
  publishArticle: (id) => apiFetch(`/api/articles/${id}/publish`, { method: 'PATCH' }),
  addComment: (id, content) =>
    apiFetch(`/api/articles/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Manga
  getManga: (params = {}) => apiFetch('/api/manga?' + new URLSearchParams(params)),
  addManga: (data) => apiFetch('/api/manga', { method: 'POST', body: JSON.stringify(data) }),

  // Exclusive
  getExclusive: () => apiFetch('/api/exclusive'),

  // Chat history (initial load)
  getChatHistory: () => apiFetch('/api/chat'),

  // Auth
  register: (data) => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};
