import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageUrl } from '../utils/format';

const STORY_DURATION_MS = 5000;

export default function StoryViewer({ stories, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const story = stories[index];

  const next = () => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setProgress(0);
    }
  };

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const pct = ((Date.now() - start) / STORY_DURATION_MS) * 100;
      if (pct >= 100) {
        clearInterval(timer);
        next();
      } else {
        setProgress(pct);
      }
    }, 50);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="relative flex h-full w-full max-w-md flex-col sm:h-[90vh] sm:rounded-2xl overflow-hidden">
        {/* Progress bars */}
        <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-[width] duration-100 ease-linear"
                style={{ width: `${i < index ? 100 : i === index ? progress : 0}%` }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute inset-x-3 top-6 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={imageUrl(story.owner?.profileImage)}
              className="h-8 w-8 rounded-full border border-white/50 object-cover"
              alt=""
            />
            <span className="text-sm font-medium text-white">{story.owner?.name}</span>
          </div>
          <button onClick={onClose} className="rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50">
            <X size={18} />
          </button>
        </div>

        {/* Image */}
        <img src={imageUrl(story.image)} alt="" className="h-full w-full object-contain" />

        {/* Caption */}
        {story.caption && (
          <p className="absolute inset-x-4 bottom-6 rounded-xl bg-black/40 px-3 py-2 text-sm text-white">
            {story.caption}
          </p>
        )}

        {/* Tap zones for prev/next */}
        <button onClick={prev} className="absolute inset-y-0 left-0 w-1/3" aria-label="Previous story" />
        <button onClick={next} className="absolute inset-y-0 right-0 w-1/3" aria-label="Next story" />

        {/* Desktop nav arrows */}
        <button onClick={prev} className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 sm:block">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 sm:block">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
