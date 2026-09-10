import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, UploadCloud, Video, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import PhoneInput from '../../components/PhoneInput';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { imageUrl } from '../../utils/format';
import { RWANDA_DISTRICTS } from '../../utils/rwandaDistricts';

const amenitiesList = ['Parking', 'Water Tank', 'Security', 'Wi-Fi', 'Generator', 'Swimming Pool', 'Garden', 'CCTV'];
const MAX_VIDEO_MB = 60;

const emptyForm = {
  title: '', description: '', purpose: 'rent', propertyType: 'house', price: '', location: '',
  district: '', sector: '', cell: '', village: '',
  bedrooms: '', bathrooms: '', size: '', furnished: false, amenities: [], contactPhone: '',
};

export default function AddEditProperty() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  const listingsPath = isAdminContext ? '/admin/properties' : '/dashboard/listings';

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // new File objects
  const [existingImages, setExistingImages] = useState([]);
  const [video, setVideo] = useState(null); // new File
  const [existingVideo, setExistingVideo] = useState('');
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // New listings default the contact number to the account's registered phone,
  // so the WhatsApp/call buttons on the listing always reach a real, verified number.
  // It stays editable in case a different line should be used for this listing.
  useEffect(() => {
    if (!isEdit && user?.phone) {
      setForm((f) => ({ ...f, contactPhone: user.phone }));
    }
  }, [isEdit, user]);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/properties/${id}`).then((res) => {
      const p = res.data.property;
      setForm({
        title: p.title, description: p.description, purpose: p.purpose, propertyType: p.propertyType,
        price: p.price, location: p.location,
        district: p.district || '', sector: p.sector || '', cell: p.cell || '', village: p.village || '',
        bedrooms: p.bedrooms, bathrooms: p.bathrooms,
        size: p.size, furnished: p.furnished, amenities: p.amenities || [], contactPhone: p.contactPhone,
      });
      setExistingImages(p.images || []);
      setExistingVideo(p.video || '');
    });
  }, [id, isEdit]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const total = images.length + existingImages.length + files.length;
    if (total > 10) {
      toast.error('You can upload up to 10 images');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video must be under ${MAX_VIDEO_MB}MB`);
      return;
    }
    setVideo(file);
    setRemoveExistingVideo(false);
  };

  const removeNewVideo = () => setVideo(null);
  const removeExistingVideoFile = () => {
    setExistingVideo('');
    setRemoveExistingVideo(true);
  };

  const removeNewImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = 'Title is required';
    if (!form.description) errs.description = 'Description is required';
    if (!form.price) errs.price = 'Price is required';
    if (!form.location) errs.location = 'Location is required';
    if (!form.contactPhone) errs.contactPhone = 'Contact phone is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'amenities') data.append(k, v.join(','));
        else data.append(k, v);
      });
      images.forEach((img) => data.append('images', img));
      if (video) data.append('video', video);
      if (isEdit && removeExistingVideo) data.append('removeVideo', 'true');

      if (isEdit) {
        await api.put(`/properties/${id}`, data);
        toast.success(isAdminContext ? 'Listing updated' : 'Listing updated — pending re-review');
      } else {
        await api.post('/properties', data);
        toast.success(isAdminContext ? 'Property published' : 'Property submitted for review');
      }
      navigate(listingsPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl text-charcoal">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isAdminContext
          ? 'Listings you add or edit as an admin publish immediately — no review step needed.'
          : isEdit
            ? 'Changes will be re-reviewed before appearing publicly.'
            : 'New listings start as "Pending Review" until approved.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Input label="Property Title" value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Description</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
          />
          {errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description}</span>}
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Purpose" value={form.purpose} onChange={(e) => update('purpose', e.target.value)}>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </Select>
          <Select label="Property Type" value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)}>
            {['house', 'apartment', 'villa', 'commercial', 'plot'].map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Price (RWF)" type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} error={errors.price} />
          <Input label="Size (m²)" type="number" min="0" value={form.size} onChange={(e) => update('size', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Location (neighborhood)" value={form.location} onChange={(e) => update('location', e.target.value)} error={errors.location} />
          <Select label="District" value={form.district} onChange={(e) => update('district', e.target.value)}>
            <option value="">Select district</option>
            {RWANDA_DISTRICTS.map((group) => (
              <optgroup key={group.province} label={group.province}>
                {group.districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </optgroup>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Sector" value={form.sector} onChange={(e) => update('sector', e.target.value)} />
          <Input label="Cell" value={form.cell} onChange={(e) => update('cell', e.target.value)} />
          <Input label="Village" value={form.village} onChange={(e) => update('village', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Bedrooms" type="number" min="0" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} />
          <Input label="Bathrooms" type="number" min="0" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} />
          <div>
            <PhoneInput label="Contact Phone" value={form.contactPhone} onChange={(v) => update('contactPhone', v)} error={errors.contactPhone} />
            <p className="mt-1 text-xs text-gray-400">Used for the Call and WhatsApp buttons on this listing.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" checked={form.furnished} onChange={(e) => update('furnished', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-forest-600 focus-ring" />
          Furnished
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Amenities</span>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.amenities.includes(a) ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Property Images (up to 10)</span>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-sm text-gray-500 transition-colors hover:border-forest-300 hover:bg-forest-50/30">
            <UploadCloud size={18} /> Click to upload images
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>

          {(existingImages.length > 0 || images.length > 0) && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {existingImages.map((img, i) => (
                <div key={`existing-${i}`} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={imageUrl(img)} className="h-full w-full object-cover" alt="" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {images.map((img, i) => (
                <div key={`new-${i}`} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(img)} className="h-full w-full object-cover" alt="" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-charcoal">House Video (optional)</span>
          <p className="mb-2 text-xs text-gray-400">A short walkthrough video (mp4, mov, webm — up to {MAX_VIDEO_MB}MB) helps seekers picture the place.</p>

          {!video && !existingVideo && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 text-sm text-gray-500 transition-colors hover:border-forest-300 hover:bg-forest-50/30">
              <Video size={18} /> Click to upload a video
              <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*" className="hidden" onChange={handleVideoFile} />
            </label>
          )}

          {existingVideo && (
            <div className="relative mt-1 overflow-hidden rounded-xl border border-gray-100">
              <video src={imageUrl(existingVideo)} controls className="max-h-56 w-full bg-black" />
              <button
                type="button"
                onClick={removeExistingVideoFile}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white hover:bg-black/75"
              >
                <X size={12} /> Remove
              </button>
            </div>
          )}

          {video && (
            <div className="relative mt-1 overflow-hidden rounded-xl border border-gray-100 bg-forest-50/40 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-forest-800">
                <Film size={16} /> {video.name}
                <span className="text-xs text-gray-400">({(video.size / (1024 * 1024)).toFixed(1)} MB)</span>
              </div>
              <button type="button" onClick={removeNewVideo} className="mt-2 text-xs font-medium text-red-600 hover:underline">
                Remove video
              </button>
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {isEdit ? 'Save Changes' : isAdminContext ? 'Publish Property' : 'Submit Property'}
        </Button>
      </form>
    </div>
  );
}
