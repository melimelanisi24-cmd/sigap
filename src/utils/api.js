// Helper koneksi API SIGAP yang mendukung Vite dev server & Apache XAMPP
export const getApiUrl = (endpoint) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/sigap')) {
    return `/sigap/api${path}`;
  }
  return `/api${path}`;
};

export async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || `HTTP Error ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

