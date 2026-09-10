import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bed, Bath, Ruler, MapPin, Phone, MessageCircle, MessageSquare, Heart, BadgeCheck, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatPrice, imageUrl } from '../utils/format';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import PropertyCard from '../components/PropertyCard';

const reportReasons = [
  { value: 'fake', label: 'Fake property' },
  { value: 'wrong_info', label: 'Wrong information' },
  { value: 'scam', label: 'Scam' },
  { value: 'wrong_price', label: 'Wrong price' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [reportReason, setReportReason] = useState('fake');
  const [reportDesc, setReportDesc] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/${id}`)
      .then((res) => {
        setProperty(res.data.property);
        setSimilar(res.data.similar);
        setActiveImage(0);
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendMessage = async () => {
    if (!user) return toast.error('Log in to contact the owner');
    if (!messageText.trim()) return;
    setSending(true);
    try {
      await api.post('/messages', {
        receiver: property.owner._id,
        property: property._id,
        message: messageText,
      });
      toast.success('Message sent');
      setMessageOpen(false);
      setMessageText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReport = async () => {
    if (!user) return toast.error('Log in to report a listing');
    setSending(true);
    try {
      await api.post('/reports', { property: property._id, reason: reportReason, description: reportDesc });
      toast.success('Report submitted. Our team will review it.');
      setReportOpen(false);
      setReportDesc('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSending(false);
    }
  };

  const handleSave = async () => {
    if (!user) return toast.error('Log in to save properties');
    try {
      await api.post(`/favorites/${property._id}`);
      toast.success('Saved to favorites');
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!property) return <div className="py-24 text-center text-gray-500">Property not found.</div>;

  const images = property.images?.length ? property.images : [null];
  const waNumber = property.contactPhone?.replace(/[^0-9]/g, '');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl">
            <img src={imageUrl(images[activeImage])} alt={property.title} className="h-[380px] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ${
                    i === activeImage ? 'ring-forest-600' : 'ring-transparent'
                  }`}
                >
                  <img src={imageUrl(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge tone={property.purpose === 'rent' ? 'green' : 'gold'}>
              {property.purpose === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
            {property.isVerified && (
              <Badge tone="green"><BadgeCheck size={13} /> Verified Property</Badge>
            )}
            <Badge tone="gray">{property.propertyType}</Badge>
          </div>

          <h1 className="mt-3 font-display text-2xl text-charcoal sm:text-3xl">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={15} /> {property.location} {property.address && `— ${property.address}`}
          </p>
          <p className="mt-3 font-display text-2xl font-medium text-forest-700">
            {formatPrice(property.price, property.purpose)}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-2 text-sm text-charcoal"><Bed size={17} /> {property.bedrooms} Bedrooms</div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-2 text-sm text-charcoal"><Bath size={17} /> {property.bathrooms} Bathrooms</div>
            )}
            {property.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-charcoal"><Ruler size={17} /> {property.size} m²</div>
            )}
            <div className="text-sm text-charcoal">{property.furnished ? 'Furnished' : 'Unfurnished'}</div>
          </div>

          {property.video && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-black shadow-sm">
              <video src={imageUrl(property.video)} controls className="max-h-[420px] w-full" />
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-lg text-charcoal">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">{property.description}</p>
          </div>

          {property.amenities?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg text-charcoal">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-forest-50 px-3 py-1.5 text-xs font-medium text-forest-700">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - contact */}
        <div>
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-gray-400">Listed by</p>
            <p className="mt-1 font-display text-lg text-charcoal">{property.owner?.name}</p>
            <div className="mt-4 flex flex-col gap-4">
              <a href={`tel:${property.contactPhone}`} className="block">
                <Button variant="primary" className="w-full">
                  <Phone size={16} /> Call {property.contactPhone}
                </Button>
              </a>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="block">
                <Button variant="secondary" className="w-full">
                  <MessageSquare size={16} /> WhatsApp
                </Button>
              </a>
              <Button variant="outline" className="w-full" onClick={() => setMessageOpen(true)}>
                <MessageCircle size={16} /> Send Message
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSave}>
                <Heart size={16} /> Save Property
              </Button>
            </div>
            <button
              onClick={() => setReportOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500"
            >
              <Flag size={13} /> Report this listing
            </button>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-xl text-charcoal">Similar Properties</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        </div>
      )}

      <Modal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title="Message the owner"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMessageOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={sending} onClick={handleSendMessage}>Send</Button>
          </>
        }
      >
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
          placeholder={`Hi, I'm interested in "${property.title}"...`}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus-ring focus:border-forest-500"
        />
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report this listing"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={sending} onClick={handleReport}>Submit report</Button>
          </>
        }
      >
        <div className="space-y-3">
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            {reportReasons.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <textarea
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
            rows={3}
            placeholder="Add more details (optional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </Modal>
    </div>
  );
}
