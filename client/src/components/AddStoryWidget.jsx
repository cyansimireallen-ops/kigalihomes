import { useEffect, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { imageUrl } from '../utils/format';
import Button from './Button';

// Drop this into Profile.jsx for owner/agent/admin accounts (not seekers —
// seekers don't list anything, so a story from them wouldn't have a purpose).
// Usage: <AddStoryWidget /> — no props needed, it manages its own state.
export default function AddStoryWidget() {
  const [myStories, setMyStories] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  const load = () => {
    api.get('/stories/mine').then((res) => setMyStories(res.data.stories || []));
  };

  useEffect(load, []);

  const activeStories = myStories.filter((s) => new Date(s.expiresAt) > new Date());

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handlePost = async () => {
    if (!file) return toast.error('Choose an image first');
    setPosting(true);
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('caption', caption);
      await api.post('/stories', data);
      toast.success('Story posted — visible on the homepage for 24 hours');
      setFile(null);
      setCaption('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post story');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/stories/${id}`);
      toast.success('Story removed');
      setMyStories((list) => list.filter((s) => s._id !== id));
    } catch {
      toast.error('Failed to remove story');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg text-charcoal">Stories</h2>
      <p className="mt-1 text-sm text-gray-500">
        Post a quick photo update — it shows on the homepage story bar for 24 hours, then disappears automatically.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!file ? (
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500 hover:border-forest-300 hover:bg-forest-50/30">
            <Camera size={18} /> Choose a photo
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        ) : (
          <div className="flex items-center gap-3">
            <img src={URL.createObjectURL(file)} className="h-16 w-16 rounded-lg object-cover" alt="" />
            <button onClick={() => setFile(null)} className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {file && (
        <>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            maxLength={200}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus-ring focus:border-forest-500"
          />
          <Button className="mt-3" loading={posting} onClick={handlePost}>Post Story</Button>
        </>
      )}

      {activeStories.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Currently live</p>
          <div className="flex flex-wrap gap-3">
            {activeStories.map((s) => (
              <div key={s._id} className="relative">
                <img src={imageUrl(s.image)} className="h-16 w-16 rounded-lg object-cover" alt="" />
                <button
                  onClick={() => handleDelete(s._id)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  title="Remove"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
