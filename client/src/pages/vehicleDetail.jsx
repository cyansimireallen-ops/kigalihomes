import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gauge, Fuel, Calendar, Settings2, MapPin, Phone, MessageCircle, MessageSquare, Heart, BadgeCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice, imageUrl } from '../utils/format';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import VehicleCard from '../components/VehicleCard';

export default function VehicleDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/vehicles/${id}`)
      .then((res) => {
        setVehicle(res.data.vehicle);
        setSimilar(res.data.similar || []);
        setActiveImage(0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!user) return toast.error('Log in to save vehicles');
    try {
      await api.post(`/favorites/${id}`);
      toast.success('Saved to favorites');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleSendMessage = async () => {
    if (!user) return toast.error('Log in to send a message');
    if (!messageText.trim()) return;
    try {
      await api.post('/messages', { receiver: vehicle.owner._id, property: vehicle._id, message: messageText });
      toast.success('Message sent');
      setMessageText('');
      setMessageOpen(false);
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!vehicle) return <div className="py-24 text-center text-gray-500">Vehicle not found.</div>;

  const images = vehicle.images?.length ? vehicle.images : [null];

  const toWhatsAppNumber = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    if (phone.trim().startsWith('+')) return digits;
    if (digits.length === 10 && digits.startsWith('0')) return `250${digits.slice(1)}`;
    if (digits.length === 9) return `250${digits}`;
    return digits;
  };
  const waNumber = toWhatsAppNumber(vehicle.contactPhone);

  const handleCopyPhone = () => {
    const number = vehicle.contactPhone;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(number).then(
        () => toast.success('Phone number copied'),
        () => toast.error('Could not copy — number is ' + number)
      );
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = number;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast.success('Phone number copied');
      } catch {
        toast.error('Could not copy — number is ' + number);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleWhatsAppClick = (e) => {
    if (!waNumber || waNumber.length < 10) {
      e.preventDefault();
      toast.error('This listing has no valid WhatsApp number on file');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl">
            <img src={imageUrl(images[activeImage])} alt={vehicle.title} className="aspect-[16/10] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-forest-600' : 'border-transparent'
                  }`}
                >
                  <img src={imageUrl(img)} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {vehicle.video && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-black shadow-sm">
              <video src={imageUrl(vehicle.video)} controls className="max-h-[420px] w-full" />
            </div>
          )}

          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={vehicle.purpose === 'rent' ? 'gold' : 'green'}>{vehicle.purpose === 'rent' ? 'For Rent' : 'For Sale'}</Badge>
              {vehicle.isVerified && <Badge tone="green"><BadgeCheck size={12} className="mr-1 inline" /> Verified</Badge>}
              <span className="text-xs uppercase tracking-wide text-gray-400">{vehicle.vehicleType}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl text-charcoal sm:text-3xl">{vehicle.title}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={15} /> {vehicle.location} {vehicle.address && `— ${vehicle.address}`}
            </p>
            <p className="mt-4 font-display text-3xl text-forest-700">{formatPrice(vehicle.price, vehicle.purpose)}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-4">
              <div className="text-center">
                <Calendar size={18} className="mx-auto text-forest-600" />
                <p className="mt-1 text-sm font-medium text-charcoal">{vehicle.year}</p>
                <p className="text-xs text-gray-400">Year</p>
              </div>
              <div className="text-center">
                <Gauge size={18} className="mx-auto text-forest-600" />
                <p className="mt-1 text-sm font-medium text-charcoal">{vehicle.mileage?.toLocaleString() || 0} km</p>
                <p className="text-xs text-gray-400">Mileage</p>
              </div>
              {vehicle.fuelType && vehicle.fuelType !== 'n/a' && (
                <div className="text-center">
                  <Fuel size={18} className="mx-auto text-forest-600" />
                  <p className="mt-1 text-sm font-medium capitalize text-charcoal">{vehicle.fuelType}</p>
                  <p className="text-xs text-gray-400">Fuel</p>
                </div>
              )}
              {vehicle.transmission && vehicle.transmission !== 'n/a' && (
                <div className="text-center">
                  <Settings2 size={18} className="mx-auto text-forest-600" />
                  <p className="mt-1 text-sm font-medium capitalize text-charcoal">{vehicle.transmission}</p>
                  <p className="text-xs text-gray-400">Transmission</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="font-display text-lg text-charcoal">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{vehicle.description}</p>
            </div>

            {vehicle.features?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-lg text-charcoal">Features</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span key={f} className="rounded-full bg-forest-50 px-3 py-1.5 text-xs font-medium text-forest-700">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-400">Listed by</p>
            <p className="mt-1 font-display text-lg text-charcoal">{vehicle.owner?.name}</p>

            <div className="mt-4 flex flex-col gap-3">
              <Button href={`tel:${vehicle.contactPhone}`} variant="primary" className="w-full" onClick={handleCopyPhone}>
                <Phone size={16} /> Call {vehicle.contactPhone}
              </Button>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="-mt-1.5 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-forest-700"
              >
                <Copy size={13} /> Copy number to clipboard
              </button>
              <Button href={`https://wa.me/${waNumber}`} variant="secondary" className="w-full" onClick={handleWhatsAppClick}>
                <MessageSquare size={16} /> WhatsApp
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMessageOpen(true)}>
                <MessageCircle size={16} /> Send Message
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSave}>
                <Heart size={16} /> Save Vehicle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl text-charcoal">Similar Vehicles</h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
        </div>
      )}

      <Modal open={messageOpen} onClose={() => setMessageOpen(false)} title={`Message ${vehicle.owner?.name}`} footer={<Button onClick={handleSendMessage}>Send</Button>}>
        <textarea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Hi, is this vehicle still available?"
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
        />
      </Modal>
    </div>
  );
}
