import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const PLACEHOLDER = `[Verse 1]
G                Em
Here's an example of a chord tab
C                D
Chords sit above the lyrics like this

[Chorus]
G        D        Em       C
Play around with the chords and lyrics
G        D        C
Keep lines aligned using spaces`;

export default function TabEditor({ tab, onSave, onBack, onDelete }) {
  const isNew = !tab;
  const [title, setTitle] = useState(tab?.title ?? '');
  const [artist, setArtist] = useState(tab?.artist ?? '');
  const [content, setContent] = useState(tab?.content ?? '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(tab?.title ?? '');
    setArtist(tab?.artist ?? '');
    setContent(tab?.content ?? '');
    setErrors({});
  }, [tab]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: tab?.id ?? crypto.randomUUID(),
      title: title.trim(),
      artist: artist.trim(),
      content: content,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-white font-semibold text-base">
            {isNew ? 'Add New Tab' : 'Edit Tab'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
            <button
              onClick={() => onDelete(tab.id)}
              className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={15} />
            Save
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Song Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wonderwall"
            className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-700 focus:border-purple-500'
            }`}
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">Artist</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Oasis"
            className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex-1">
          <label className="block text-gray-400 text-xs mb-1.5 font-medium">
            Tab / Chords *
            <span className="text-gray-600 font-normal ml-1">(paste raw chord text here)</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={20}
            spellCheck={false}
            className={`w-full bg-gray-900 border rounded-lg px-3 py-2.5 text-sm text-green-300 font-mono placeholder-gray-700 focus:outline-none transition-colors resize-none leading-relaxed ${
              errors.content ? 'border-red-500' : 'border-gray-700 focus:border-purple-500'
            }`}
          />
          {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content}</p>}
        </div>
      </div>
    </div>
  );
}
