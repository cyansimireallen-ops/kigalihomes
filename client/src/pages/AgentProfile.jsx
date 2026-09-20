import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Calendar } from 'lucide-react';
import api from '../api/axios';
import { imageUrl } from '../utils/format';
import PropertyCard from '../components/PropertyCard';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AgentProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/agents/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="py-24 text-center text-gray-500">Profile not found.</div>;

  const { profile, properties, vehicles } = data;
  const totalListings = (properties?.length || 0) + (vehicles?.length || 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
        <img
          src={imageUrl(profile.profileImage)}
          alt={profile.name}
          className="h-24 w-24 rounded-full border-4 border-forest-50 object-cover"
        />
        <div>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="font-display text-2xl text-charcoal">{profile.name}</h1>
            {profile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-700">
                <BadgeCheck size={12} /> KigaliHomes Team
              </span>
            )}
          </div>
          {profile.bio && <p className="mt-2 max-w-xl text-sm text-gray-600">{profile.bio}</p>}
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400 sm:justify-start">
            <Calendar size={13} /> Member since {new Date(profile.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
            {' · '}{totalListings} active listing{totalListings === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {properties?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">Properties</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        </div>
      )}

      {vehicles?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-charcoal">Vehicles</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        </div>
      )}

      {totalListings === 0 && (
        <p className="mt-10 text-center text-sm text-gray-400">No active listings right now.</p>
      )}
    </div>
  );
}
