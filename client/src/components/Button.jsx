export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 focus-ring disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-forest-600 text-white hover:bg-forest-700',
    secondary: 'bg-gold-400 text-forest-900 hover:bg-gold-500',
    outline: 'border border-forest-600 text-forest-700 hover:bg-forest-50',
    ghost: 'text-forest-700 hover:bg-forest-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}
