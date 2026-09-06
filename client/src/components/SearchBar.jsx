import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const propertyTypes = ['house', 'apartment', 'villa', 'commercial', 'plot'];

export default function SearchBar({ compact = false }) {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('purpose', purpose);
    if (location) params.set('location', location);
    if (propertyType) params.set('propertyType', propertyType);
    if (maxPrice) params.set('maxPrice', maxPrice);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full rounded-2xl bg-white/95 p-3 shadow-card backdrop-blur ${compact ? '' : 'sm:p-4'}`}
    >
      <div className="mb-3 flex gap-2">
        {['rent', 'sale'].map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPurpose(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              purpose === p ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'rent' ? 'Rent' : 'Buy'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location e.g. Kimihurura"
          className="rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
        />
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm capitalize focus-ring focus:border-forest-500"
        >
          <option value="">Property type</option>
          {propertyTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
          min="0"
          placeholder="Max price (RWF)"
          className="rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-lg bg-forest-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-700"
        >
          <Search size={16} /> Search
        </button>
      </div>
    </form>
  );
}
