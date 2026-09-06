export default function Badge({ children, tone = 'green' }) {
  const tones = {
    green: 'bg-forest-50 text-forest-700 ring-1 ring-forest-200',
    gold: 'bg-gold-50 text-gold-700 ring-1 ring-gold-200',
    gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
    red: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
