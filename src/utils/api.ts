import { BlogPost, PageContent } from '../types';

const TOKEN_STORAGE_KEY = 'admin_session_token';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchPosts(language?: 'pt' | 'en'): Promise<BlogPost[]> {
  const query = language ? `?language=${encodeURIComponent(language)}` : '';
  const res = await fetch(`/api/posts${query}`);
  if (!res.ok) {
    throw new Error('Falha ao carregar artigos.');
  }
  return res.json();
}

export async function fetchPostById(id: string): Promise<BlogPost | null> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Falha ao carregar o artigo.');
  }
  return res.json();
}

export interface SavePostPayload {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  date: string;
  readTime: string;
  author: string;
  authorPhotoUrl?: string;
  language: 'pt' | 'en';
}

export async function createPost(payload: SavePostPayload): Promise<BlogPost> {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao publicar o artigo.');
  }
  return data;
}

export async function updatePost(id: string, payload: SavePostPayload): Promise<BlogPost> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao atualizar o artigo.');
  }
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao excluir o artigo.');
  }
}

export async function fetchPages(): Promise<PageContent[]> {
  const res = await fetch('/api/pages');
  if (!res.ok) {
    throw new Error('Falha ao carregar páginas.');
  }
  return res.json();
}

export async function fetchPageById(id: string): Promise<PageContent | null> {
  const res = await fetch(`/api/pages/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error('Falha ao carregar a página.');
  }
  return res.json();
}

export interface SavePagePayload {
  title: string;
  subtitle?: string;
  content: string;
  showInNav?: boolean;
  homeConfig?: PageContent['homeConfig'];
  aboutConfig?: PageContent['aboutConfig'];
  sections?: PageContent['sections'];
}

export async function createPage(payload: SavePagePayload & { id: string }): Promise<PageContent> {
  const res = await fetch('/api/pages', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao criar a página.');
  }
  return data;
}

export async function updatePage(id: string, payload: SavePagePayload): Promise<PageContent> {
  const res = await fetch(`/api/pages/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Falha ao salvar a página.');
  }
  return data;
}

export async function deletePage(id: string): Promise<void> {
  const res = await fetch(`/api/pages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Falha ao excluir a página.');
  }
}
