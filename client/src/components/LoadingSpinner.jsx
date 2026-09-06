export default function LoadingSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-forest-200 border-t-forest-600" />
    </div>
  );
}
