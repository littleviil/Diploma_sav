const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json();
}

export const fetchRemoteStore = () => request('/api/store');

export const saveRemoteStore = (store) =>
  request('/api/store', {
    method: 'PUT',
    body: JSON.stringify(store),
  });
