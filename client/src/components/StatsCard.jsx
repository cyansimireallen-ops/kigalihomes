export default function StatsCard({ label, value, icon: Icon, tone = 'green' }) {
  const tones = {
    green: 'bg-forest-50 text-forest-700',
    gold: 'bg-gold-50 text-gold-700',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 font-display text-2xl text-charcoal">{value}</p>
        </div>
        {Icon && (
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
