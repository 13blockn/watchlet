const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export const api = {
  getDashboard: () => request('/dashboard'),
  getModules: () => request('/modules'),
  getQuiz: (slug, mode = 'module') => request(`/modules/${slug}/quiz?mode=${mode}`),
  submitQuiz: (payload) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(payload) }),
  search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
  getStats: () => request('/stats')
};
