import { Link } from 'react-router-dom';
import { Bed, Bath, MapPin, Heart, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import Badge from './Badge';
import { formatPrice, imageUrl } from '../utils/format';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function PropertyCard({ property, initiallySaved = false }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Log in to save properties');
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        await api.delete(`/favorites/${property._id}`);
        setSaved(false);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/favorites/${property._id}`);
        setSaved(true);
        toast.success('Saved to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-card"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl(property.images?.[0])}
          alt={property.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge tone={property.purpose === 'rent' ? 'green' : 'gold'}>
            {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
          {property.isFeatured && <Badge tone="gray">Featured</Badge>}
        </div>
        <button
          onClick={toggleFavorite}
          disabled={busy}
          aria-label={saved ? 'Remove from favorites' : 'Save property'}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-forest-700 shadow hover:bg-white"
        >
          <Heart size={17} fill={saved ? '#c98d21' : 'none'} color={saved ? '#c98d21' : 'currentColor'} />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="line-clamp-1 font-display text-base text-charcoal">{property.title}</h3>
          {property.isVerified && <BadgeCheck size={15} className="shrink-0 text-forest-600" />}
        </div>
        <p className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={14} /> {property.location}
        </p>
        <p className="mb-3 font-display text-lg font-medium text-forest-700">
          {formatPrice(property.price, property.purpose)}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={15} /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={15} /> {property.bathrooms}
            </span>
          )}
          <span className="capitalize">{property.propertyType}</span>
        </div>
      </div>
    </Link>
  );
}
