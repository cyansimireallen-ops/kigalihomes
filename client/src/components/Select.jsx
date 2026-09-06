export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-charcoal">{label}</span>}
      <select
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-charcoal focus-ring ${
          error ? 'border-red-400' : 'border-gray-300 focus:border-forest-500'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
