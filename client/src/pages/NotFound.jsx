import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl text-forest-600">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-charcoal">This page wandered off.</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        We couldn't find the page you're looking for. It may have been moved or no longer exists.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-forest-700"
      >
        <HomeIcon size={16} /> Back to home
      </Link>
    </div>
  );
}
