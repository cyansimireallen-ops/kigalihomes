import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Car } from 'lucide-react';
import api from '../api/axios';
import VehicleCard from '../components/VehicleCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import { VEHICLE_TYPES } from '../utils/vehicleConstants';

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    purpose: searchParams.get('purpose') || '',
    vehicleType: searchParams.get('vehicleType') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const load = () => {
    setLoading(true);
    const params = { ...filters, sort, page };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    setSearchParams(params);

    api
      .get('/vehicles', { params })
      .then((res) => {
        setVehicles(res.data.vehicles);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [sort, page]);

  const applyFilters = (e) => {
    e?.preventDefault();
    setPage(1);
    load();
  };

  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-charcoal">Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500">{loading ? 'Searching…' : `${total} results found`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </Select>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={15} /> Filters
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <form
          onSubmit={applyFilters}
          className={`space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1 lg:block ${showFilters ? 'block' : 'hidden'}`}
        >
          <Select label="Purpose" value={filters.purpose} onChange={(e) => update('purpose', e.target.value)}>
            <option value="">All</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </Select>
          <Select label="Vehicle type" value={filters.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
            <option value="">Any type</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Location" value={filters.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. Kicukiro" />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-charcoal">Price range (RWF)</span>
            <div className="flex gap-2">
              <input
                type="number" min="0" placeholder="Min" value={filters.minPrice}
                onChange={(e) => update('minPrice', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-ring focus:border-forest-500"
              />
              <input
                type="number" min="0" placeholder="Max" value={filters.maxPrice}
                onChange={(e) => update('maxPrice', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus-ring focus:border-forest-500"
              />
            </div>
          </div>
          <Button type="submit" className="w-full">Apply Filters</Button>
        </form>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyState icon={Car} title="No vehicles found" description="Try adjusting your filters or search a different location." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
              </div>
              {pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        page === i + 1 ? 'bg-forest-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
