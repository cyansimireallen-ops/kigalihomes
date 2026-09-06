import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Heart, MessageSquare, Clock, Search } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import { RowSkeleton } from '../../components/Skeleton';
import Badge from '../../components/Badge';
import { imageUrl, formatPrice } from '../../utils/format';

const statusTone = { pending: 'gold', approved: 'green', rejected: 'red', sold: 'gray', rented: 'gray' };

function SeekerDashboard({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [messageThreads, setMessageThreads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/favorites'), api.get('/messages')])
      .then(([fRes, mRes]) => {
        setFavorites(fRes.data.favorites || []);
        setMessageThreads((mRes.data.conversations || mRes.data.messages || []).length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-gray-500">Here's what's happening with your KigaliHomes account.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatsCard label="Saved Properties" value={favorites.length} icon={Heart} tone="gold" />
        <StatsCard label="Conversations" value={messageThreads} icon={MessageSquare} tone="green" />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-charcoal">Recently Saved</h2>
          <Link to="/favorites" className="text-sm font-medium text-forest-700 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
        ) : favorites.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nothing saved yet. <Link to="/properties" className="text-forest-700 underline">Browse properties</Link> and tap the heart icon to save one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {favorites.slice(0, 5).map((f) => {
              const p = f.property || f;
              return (
                <li key={f._id} className="flex items-center gap-3 py-3">
                  <img src={imageUrl(p.images?.[0])} className="h-12 w-16 shrink-0 rounded-lg object-cover" alt="" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/properties/${p._id}`} className="line-clamp-1 text-sm font-medium text-charcoal hover:underline">{p.title}</Link>
                    <p className="text-xs text-gray-400">{formatPrice(p.price, p.purpose)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link
        to="/properties"
        className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-dashed border-forest-200 bg-forest-50/50 px-4 py-4 text-sm font-medium text-forest-700 hover:bg-forest-50"
      >
        <Search size={16} /> Search for your next home
      </Link>
    </div>
  );
}

function OwnerDashboard({ user }) {
  const [listings, setListings] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/properties/mine/all'), api.get('/favorites')])
      .then(([lRes, fRes]) => {
        setListings(lRes.data.properties);
        setFavoritesCount(fRes.data.favorites.length);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-charcoal">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-gray-500">Here's what's happening with your KigaliHomes account.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard label="My Listings" value={listings.length} icon={Building2} tone="green" />
        <StatsCard label="Saved Properties" value={favoritesCount} icon={Heart} tone="gold" />
        <StatsCard label="Pending Review" value={listings.filter((l) => l.status === 'pending').length} icon={Clock} tone="red" />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-charcoal">Recent Activity</h2>
          <Link to="/dashboard/listings" className="text-sm font-medium text-forest-700 hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="space-y-2"><RowSkeleton /><RowSkeleton /><RowSkeleton /></div>
        ) : listings.length === 0 ? (
          <p className="text-sm text-gray-500">No listings yet. <Link to="/dashboard/listings/new" className="text-forest-700 underline">Add your first property</Link>.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {listings.slice(0, 5).map((l) => (
              <li key={l._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{l.title}</p>
                  <p className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge tone={statusTone[l.status]}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  if (user?.role === 'seeker') return <SeekerDashboard user={user} />;
  return <OwnerDashboard user={user} />;
}
