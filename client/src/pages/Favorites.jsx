import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites').then((res) => setFavorites(res.data.favorites)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl text-charcoal">Saved Properties</h1>
      <p className="mt-1 text-sm text-gray-500">Properties you've bookmarked to revisit later.</p>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <EmptyState icon={Heart} title="No saved properties yet" description="Tap the heart icon on any listing to save it here." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => <PropertyCard key={f._id} property={f.property} initiallySaved />)}
          </div>
        )}
      </div>
    </div>
  );
}
