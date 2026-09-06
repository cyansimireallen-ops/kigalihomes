import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, SlidersHorizontal, MessageCircle, Handshake, ArrowRight } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/Skeleton';
import { imageUrl, formatPrice } from '../utils/format';
import api from '../api/axios';

const popularLocations = ['Kiyovu', 'Kimihurura', 'Remera', 'Kacyiru', 'Nyarutarama', 'Gisozi', 'Kicukiro', 'Kanombe'];

const whyUs = [
  { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every featured property is checked by our team before it goes live.' },
  { icon: SlidersHorizontal, title: 'Easy Property Search', desc: 'Filter by location, price, and type to find exactly what fits.' },
  { icon: MessageCircle, title: 'Direct Contact', desc: 'Message or call owners and agents directly, no middlemen.' },
  { icon: Handshake, title: 'Trusted Marketplace', desc: 'Built for Kigali, by people who know the neighborhoods.' },
];

const steps = [
  { step: '01', title: 'Search for a property', desc: 'Use filters for location, price, and type to narrow your search.' },
  { step: '02', title: 'View property details', desc: 'Browse photos, amenities, and everything you need to know.' },
  { step: '03', title: 'Contact the owner or agent', desc: 'Reach out directly by call, WhatsApp, or message.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showcase, setShowcase] = useState(null);

  useEffect(() => {
    api
      .get('/properties/featured')
      .then((res) => setFeatured(res.data.properties))
      .finally(() => setLoading(false));

    api
      .get('/properties', { params: { sort: 'newest', limit: 1 } })
      .then((res) => setShowcase(res.data.properties?.[0] || null))
      .catch(() => setShowcase(null));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="Modern house in Kigali"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/55 via-forest-900/35 to-forest-900/65" />
        <div className="relative z-10 w-full max-w-3xl text-center">
          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">KigaliHomes</h1>
          <p className="mt-3 font-display text-xl text-gold-200">Find a place you'll love to call home.</p>
          <p className="mx-auto mt-3 max-w-xl text-sm text-forest-100 sm:text-base">
            Discover houses, apartments and plots for rent or sale in Kigali.
          </p>
          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular locations */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl text-charcoal">Popular Locations</h2>
        <p className="mt-1 text-sm text-gray-500">Explore neighborhoods across Kigali.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {popularLocations.map((loc) => (
            <Link
              key={loc}
              to={`/properties?location=${loc}`}
              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition hover:border-forest-200 hover:shadow-card"
            >
              <span className="text-sm font-medium text-charcoal">{loc}</span>
              <ArrowRight size={15} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-forest-600" />
            </Link>
          ))}
        </div>
      </section>

      {/* Showcase banner — a real listed property, with a big "View all" CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <img
            src={imageUrl(showcase?.images?.[0])}
            alt={showcase?.title || 'A property listed on KigaliHomes'}
            className="h-[320px] w-full object-cover sm:h-[380px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-900/80 via-forest-900/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              {showcase ? 'On the market right now' : 'Every home, in one place'}
            </p>
            <h2 className="mt-3 max-w-lg font-display text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
              {showcase ? showcase.title : 'Hundreds of houses, apartments and plots across Kigali'}
            </h2>
            <p className="mt-3 max-w-md text-sm text-forest-100 sm:text-base">
              {showcase
                ? `${showcase.location} · ${formatPrice(showcase.price, showcase.purpose)}`
                : 'Browse the full marketplace and filter by location, price, and property type.'}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to={showcase ? `/properties/${showcase._id}` : '/properties'}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-gold-400 px-8 py-4 text-base font-semibold text-forest-900 shadow-lg shadow-forest-900/30 transition-transform hover:scale-[1.02] hover:bg-gold-500"
              >
                {showcase ? 'View This Home' : 'View All Properties'} <ArrowRight size={20} />
              </Link>
              {showcase && (
                <Link to="/properties" className="text-sm font-medium text-white underline-offset-4 hover:underline">
                  Browse all properties
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="bg-forest-50/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl text-charcoal">Featured Properties</h2>
              <p className="mt-1 text-sm text-gray-500">Hand-picked homes worth a look.</p>
            </div>
            <Link to="/properties" className="hidden text-sm font-medium text-forest-700 hover:underline sm:block">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : featured.slice(0, 8).map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
          {!loading && featured.length === 0 && (
            <p className="mt-6 text-sm text-gray-500">No featured properties yet — check back soon.</p>
          )}
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl text-charcoal">Why Choose KigaliHomes</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-forest-50 text-forest-700">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-base text-charcoal">{title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-forest-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl text-charcoal">How It Works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <span className="font-display text-4xl text-gold-500">{s.step}</span>
                <h3 className="mt-3 font-display text-lg text-charcoal">{s.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl text-charcoal sm:text-3xl">Have a property to rent or sell?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Get in touch with our team to set up your owner/agent account and reach thousands of home seekers.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-semibold text-forest-900 transition-colors hover:bg-gold-500"
        >
          List Your Property <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
