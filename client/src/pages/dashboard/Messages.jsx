import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/EmptyState';
import { RowSkeleton } from '../../components/Skeleton';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages').then((res) => setConversations(res.data.conversations)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/messages/${active._id}`).then((res) => setThread(res.data.messages));
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      const res = await api.post('/messages', { receiver: active._id, message: text });
      setThread((t) => [...t, res.data.message]);
      setText('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl text-charcoal">Messages</h1>
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:grid-cols-3 md:gap-0">
        <div className="border-b border-gray-100 md:col-span-1 md:border-b-0 md:border-r">
          {loading ? (
            <div className="space-y-2 p-4"><RowSkeleton /><RowSkeleton /></div>
          ) : conversations.length === 0 ? (
            <div className="p-4"><EmptyState icon={MessageSquare} title="No conversations yet" description="Messages from home seekers or owners will appear here." /></div>
          ) : (
            <ul className="max-h-[520px] divide-y divide-gray-100 overflow-y-auto">
              {conversations.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => setActive(c.participant)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${
                      active?._id === c._id ? 'bg-forest-50' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-charcoal">{c.participant.name}</p>
                      <p className="line-clamp-1 text-xs text-gray-400">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-forest-600 text-[10px] text-white">{c.unread}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col md:col-span-2">
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-10 text-sm text-gray-400">Select a conversation</div>
          ) : (
            <>
              <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-charcoal">{active.name}</div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: 400 }}>
                {thread.map((m) => (
                  <div key={m._id} className={`flex ${m.sender === user._id || m.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm ${
                      (m.sender === user._id || m.sender?._id === user._id) ? 'bg-forest-600 text-white' : 'bg-gray-100 text-charcoal'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-100 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus-ring focus:border-forest-500"
                />
                <button type="submit" className="grid h-9 w-9 place-items-center rounded-lg bg-forest-600 text-white hover:bg-forest-700">
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
