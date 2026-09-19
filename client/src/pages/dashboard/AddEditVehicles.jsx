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
import { VEHICLE_TYPES, TRANSMISSIONS, FUEL_TYPES, CONDITIONS, VEHICLE_FEATURES } from '../../utils/vehicleConstants';

const MAX_VIDEO_MB = 60;

const emptyForm = {
  title: '', description: '', purpose: 'sale', vehicleType: 'car', make: '', model: '', year: '',
  mileage: '', transmission: 'automatic', fuelType: 'petrol', condition: 'used', price: '', location: '',
  district: '', sector: '', cell: '', village: '', features: [], contactPhone: '',
};

export default function AddEditVehicle() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  const listingsPath = isAdminContext ? '/admin/vehicles' : '/dashboard/vehicles';

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [existingVideo, setExistingVideo] = useState('');
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit && user?.phone) {
      setForm((f) => ({ ...f, contactPhone: user.phone }));
    }
  }, [isEdit, user]);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/vehicles/${id}`).then((res) => {
      const v = res.data.vehicle;
      setForm({
        title: v.title, description: v.description, purpose: v.purpose, vehicleType: v.vehicleType,
        make: v.make, model: v.model, year: v.year, mileage: v.mileage, transmission: v.transmission,
        fuelType: v.fuelType, condition: v.condition, price: v.price, location: v.location,
        district: v.district || '', sector: v.sector || '', cell: v.cell || '', village: v.village || '',
        features: v.features || [], contactPhone: v.contactPhone,
      });
      setExistingImages(v.images || []);
      setExistingVideo(v.video || '');
    });
  }, [id, isEdit]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleFeature = (feat) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat) ? f.features.filter((x) => x !== feat) : [...f.features, feat],
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
    if (!form.make) errs.make = 'Make is required';
    if (!form.model) errs.model = 'Model is required';
    if (!form.year) errs.year = 'Year is required';
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
        if (k === 'features') data.append(k, v.join(','));
        else data.append(k, v);
      });
      images.forEach((img) => data.append('images', img));
      if (video) data.append('video', video);
      if (isEdit && removeExistingVideo) data.append('removeVideo', 'true');

      if (isEdit) {
        await api.put(`/vehicles/${id}`, data);
        toast.success(isAdminContext ? 'Listing updated' : 'Listing updated — pending re-review');
      } else {
        await api.post('/vehicles', data);
        toast.success(isAdminContext ? 'Vehicle published' : 'Vehicle submitted for review');
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
      <h1 className="font-display text-2xl text-charcoal">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {isAdminContext
          ? 'Listings you add or edit as an admin publish immediately — no review step needed.'
          : isEdit
            ? 'Changes will be re-reviewed before appearing publicly.'
            : 'New listings start as "Pending Review" until approved.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Input label="Listing Title" value={form.title} onChange={(e) => update('title', e.target.value)} error={errors.title} placeholder="e.g. 2019 Toyota RAV4, low mileage" />

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
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </Select>
          <Select label="Vehicle Type" value={form.vehicleType} onChange={(e) => update('vehicleType', e.target.value)}>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Make" value={form.make} onChange={(e) => update('make', e.target.value)} error={errors.make} placeholder="Toyota" />
          <Input label="Model" value={form.model} onChange={(e) => update('model', e.target.value)} error={errors.model} placeholder="RAV4" />
          <Input label="Year" type="number" min="1980" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => update('year', e.target.value)} error={errors.year} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Condition" value={form.condition} onChange={(e) => update('condition', e.target.value)}>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Transmission" value={form.transmission} onChange={(e) => update('transmission', e.target.value)}>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Fuel Type" value={form.fuelType} onChange={(e) => update('fuelType', e.target.value)}>
            {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Price (RWF)" type="number" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} error={errors.price} />
          <Input label="Mileage (km)" type="number" min="0" value={form.mileage} onChange={(e) => update('mileage', e.target.value)} />
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

        <div>
          <PhoneInput label="Contact Phone" value={form.contactPhone} onChange={(v) => update('contactPhone', v)} error={errors.contactPhone} />
          <p className="mt-1 text-xs text-gray-400">Used for the Call and WhatsApp buttons on this listing.</p>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Features</span>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_FEATURES.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => toggleFeature(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.features.includes(f) ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Vehicle Images (up to 10)</span>
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
          <span className="mb-1.5 block text-sm font-medium text-charcoal">Walkthrough Video (optional)</span>
          <p className="mb-2 text-xs text-gray-400">A short video (mp4, mov, webm — up to {MAX_VIDEO_MB}MB) helps buyers see the vehicle's condition.</p>

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
          {isEdit ? 'Save Changes' : isAdminContext ? 'Publish Vehicle' : 'Submit Vehicle'}
        </Button>
      </form>
    </div>
  );
}
