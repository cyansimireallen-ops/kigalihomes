import { useEffect, useState } from 'react';
import api from '../api/axios';
import { imageUrl } from '../utils/format';
import StoryViewer from './StoryViewer';

export default function StoriesBar() {
  const [groups, setGroups] = useState([]); // one entry per owner, with their stories[]
  const [viewerGroupIndex, setViewerGroupIndex] = useState(null);

  useEffect(() => {
    api.get('/stories').then((res) => {
      const stories = res.data.stories || [];
      const byOwner = new Map();
      stories.forEach((s) => {
        const key = s.owner?._id;
        if (!key) return;
        if (!byOwner.has(key)) byOwner.set(key, { owner: s.owner, stories: [] });
        byOwner.get(key).stories.push(s);
      });
      setGroups(Array.from(byOwner.values()));
    });
  }, []);

  if (groups.length === 0) return null;

  return (
    <>
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-1">
            {groups.map((g, i) => (
              <button
                key={g.owner._id}
                onClick={() => setViewerGroupIndex(i)}
                className="flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className="rounded-full bg-gradient-to-tr from-gold-400 to-forest-600 p-[2px]">
                  <img
                    src={imageUrl(g.owner.profileImage)}
                    alt={g.owner.name}
                    className="h-14 w-14 rounded-full border-2 border-white object-cover"
                  />
                </span>
                <span className="max-w-[64px] truncate text-xs text-gray-600">{g.owner.name?.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {viewerGroupIndex !== null && (
        <StoryViewer
          stories={groups[viewerGroupIndex].stories}
          onClose={() => {
            // Move to the next owner's stories automatically once the last one ends,
            // for a continuous story-watching experience — closes after the last group.
            if (viewerGroupIndex < groups.length - 1) {
              setViewerGroupIndex(viewerGroupIndex + 1);
            } else {
              setViewerGroupIndex(null);
            }
          }}
        />
      )}
    </>
  );
}
