export function formatPrice(price, purpose) {
  const formatted = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(price);
  return purpose === 'rent' ? `RWF ${formatted}/mo` : `RWF ${formatted}`;
}

export function imageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=60';
  if (path.startsWith('http')) return path;
  return path; // served via vite proxy /uploads
}
