import { useState } from 'react';
import { Search, Plus, Guitar, Music2, Trash2 } from 'lucide-react';

export default function TabLibrary({ tabs, onSelectTab, onAddNew, onDelete }) {
  const [query, setQuery] = useState('');

  const filtered = tabs.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Guitar className="text-purple-400" size={24} />
          <h1 className="text-xl font-bold text-white tracking-tight">Guitar Tab Vault</h1>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Tab
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search songs or artists..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Tab count */}
      <div className="px-4 py-2">
        <span className="text-xs text-gray-500">
          {filtered.length} {filtered.length === 1 ? 'tab' : 'tabs'}
          {query && ` matching "${query}"`}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
            <Music2 size={48} />
            <p className="text-sm">
              {query ? 'No tabs found' : 'No tabs yet. Add your first one!'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((tab) => (
              <li
                key={tab.id}
                className="group flex items-center justify-between bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg px-4 py-3 cursor-pointer transition-all"
                onClick={() => onSelectTab(tab)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{tab.title}</p>
                  <p className="text-gray-500 text-xs truncate">{tab.artist}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 p-1 rounded transition-all ml-2"
                  title="Delete tab"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
