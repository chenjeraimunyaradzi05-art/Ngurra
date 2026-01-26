import { useState, useRef } from 'react';
import { API_BASE } from '@/lib/apiBase';
import useAuth from '../../hooks/useAuth';

const MAX_FILES = 5;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export default function PostForm({ onPost }) {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validated = [];
    for (const file of files) {
      if (media.length + validated.length >= MAX_FILES) break;
      if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
        setError('Video too large. Maximum 50MB per video.');
        continue;
      }
      validated.push({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      });
    }
    setMedia((prev) => [...prev, ...validated].slice(0, MAX_FILES));
  };

  const removeMedia = (id) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // Upload media first if any
      const mediaUrls = [];
      if (media.length > 0 && token) {
        for (const m of media) {
          try {
            const uploadRes = await fetch(`${API_BASE}/uploads/url`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ fileName: m.file.name, fileType: m.file.type }),
            });
            if (uploadRes.ok) {
              const { uploadUrl, fileUrl } = await uploadRes.json();
              await fetch(uploadUrl, {
                method: 'PUT',
                body: m.file,
                headers: { 'Content-Type': m.file.type },
              });
              mediaUrls.push(fileUrl);
            } else {
              console.warn('Failed to get upload url', await uploadRes.text());
            }
          } catch (uploadErr) {
            console.error('Media upload error:', uploadErr);
            setError('Failed to upload media.');
          }
        }
      }

      // Create post via API when possible
      if (token) {
        const res = await fetch(`${API_BASE}/feed/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            type: 'text',
            content: content.trim(),
            mediaUrls: mediaUrls.length ? mediaUrls : undefined,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          onPost(data.post || data);
        } else {
          const text = await res.text();
          setError('Failed to create post: ' + text);
        }
      } else {
        // Local fallback
        onPost({ content, media });
      }

      // reset
      setContent('');
      setMedia([]);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="bg-white rounded-xl p-4 shadow mb-6"
      onSubmit={handleSubmit}
      aria-label="Create Post"
    >
      <textarea
        className="w-full p-2 rounded border border-slate-200 mb-2"
        rows={3}
        placeholder="Share a message, story, or video..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required={!media.length}
        aria-label="Post content"
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex gap-2 mb-2 flex-wrap">
        {media.map((m) => (
          <div key={m.id} className="relative">
            {m.type === 'video' ? (
              <video src={m.preview} className="w-24 h-24 object-cover rounded" controls />
            ) : (
              <img src={m.preview} className="w-24 h-24 object-cover rounded" alt="media preview" />
            )}
            <button
              type="button"
              className="absolute top-1 right-1 bg-white rounded-full p-1 text-xs"
              onClick={() => removeMedia(m.id)}
              aria-label="Remove media"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleMediaChange}
        />
        <button
          type="button"
          className="px-3 py-1 rounded bg-slate-100"
          onClick={() => fileInputRef.current.click()}
          aria-label="Add media"
        >
          📎 Add Media
        </button>
        <button
          type="submit"
          className="ml-auto px-4 py-1 rounded bg-pink-500 text-white font-bold"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
