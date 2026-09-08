export function formatPrice(price, purpose) {
  const formatted = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(price);
  return purpose === 'rent' ? `RWF ${formatted}/mo` : `RWF ${formatted}`;
}

export function imageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60';
  if (path.startsWith('http')) return path;
  // Uploaded files (property images/videos, profile photos) are served by the
  // backend at /uploads/... . In dev this is proxied (see vite.config.js); in
  // production it needs the backend's real URL, from the same VITE_API_URL
  // used by api/axios.js.
  const API_ORIGIN = import.meta.env.VITE_API_URL || '';
  return `${API_ORIGIN}${path}`;
}