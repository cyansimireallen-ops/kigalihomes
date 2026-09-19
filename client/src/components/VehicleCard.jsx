import { Link } from 'react-router-dom';
import { Gauge, Fuel, Calendar } from 'lucide-react';
import { imageUrl, formatPrice } from '../utils/format';
import Badge from './Badge';

export default function VehicleCard({ vehicle }) {
  return (
    <Link
      to={`/vehicles/${vehicle._id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl(vehicle.images?.[0])}
          alt={vehicle.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <Badge tone={vehicle.purpose === 'rent' ? 'gold' : 'green'}>
            {vehicle.purpose === 'rent' ? 'For Rent' : 'For Sale'}
          </Badge>
          {vehicle.isFeatured && (
            <span className="rounded-full bg-forest-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              ★ Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-display text-base text-charcoal">{vehicle.title}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{vehicle.make} {vehicle.model} · {vehicle.year}</p>
        <p className="mt-2 font-display text-lg text-forest-700">{formatPrice(vehicle.price, vehicle.purpose)}</p>

        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Calendar size={13} /> {vehicle.year}</span>
          <span className="flex items-center gap-1"><Gauge size={13} /> {vehicle.mileage?.toLocaleString() || 0} km</span>
          {vehicle.fuelType && vehicle.fuelType !== 'n/a' && (
            <span className="flex items-center gap-1 capitalize"><Fuel size={13} /> {vehicle.fuelType}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
