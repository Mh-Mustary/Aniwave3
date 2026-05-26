// frontend/components/manga/MangaSection.jsx
'use client';
import { useState } from 'react';

const STATUS_STYLES = {
  ONGOING: { label: 'Ongoing', color: 'bg-emerald-100 text-emerald-800' },
  COMPLETED: { label: 'Completed', color: 'bg-purple-100 text-purple-800' },
  HIATUS: { label: 'Hiatus', color: 'bg-amber-100 text-amber-800' },
};

const COVER_EMOJIS = ['🌸', '🌙', '🌿', '🍂', '⚔️', '🦋', '🔥', '🌊'];

export default function MangaSection({ picks = [] }) {
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [selected, setSelected] = useState(null);

  const filtered =
    filter === 'all'
      ? picks
      : filter === 'featured'
      ? picks.filter((p) => p.isFeatured)
      : filter === 'staff'
      ? picks.filter((p) => p.staffPick)
      : picks.filter((p) => p.status === filter.toUpperCase());

  if (selected) {
    return <MangaDetail pick={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {['all', 'featured', 'staff', 'ONGOING', 'COMPLETED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filter === f
                  ? 'bg-teal-100 text-teal-800 border-teal-300'
                  : 'border-gray-200 text-gray-500 hover:bg-teal-50 hover:text-teal-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'featured' ? '⭐ Featured' : f === 'staff' ? '👾 Staff picks' : STATUS_STYLES[f]?.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setView('grid')} className={`p-1.5 rounded-lg text-sm ${view === 'grid' ? 'bg-gray-100' : 'text-gray-400'}`}>⊞</button>
          <button onClick={() => setView('list')} className={`p-1.5 rounded-lg text-sm ${view === 'list' ? 'bg-gray-100' : 'text-gray-400'}`}>☰</button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((pick, i) => (
            <div
              key={pick.id}
              onClick={() => setSelected(pick)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:border-teal-200 hover:shadow-sm transition-all group"
            >
              <div className="h-32 flex items-center justify-center text-4xl bg-gradient-to-br from-teal-50 to-emerald-50 relative">
                {pick.coverUrl
                  ? <img src={pick.coverUrl} alt={pick.title} className="w-full h-full object-cover" />
                  : COVER_EMOJIS[i % COVER_EMOJIS.length]
                }
                {pick.staffPick && (
                  <span className="absolute top-2 right-2 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">Staff</span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-600 transition-colors">{pick.title}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">{pick.author}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[pick.status]?.color}`}>
                    {STATUS_STYLES[pick.status]?.label}
                  </span>
                  {pick.latestChapter && (
                    <span className="text-xs text-gray-400">Ch. {pick.latestChapter}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((pick, i) => (
            <div
              key={pick.id}
              onClick={() => setSelected(pick)}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 cursor-pointer hover:border-teal-200 transition-all group"
            >
              <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-xl flex-shrink-0">
                {COVER_EMOJIS[i % COVER_EMOJIS.length]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors truncate">{pick.title}</h3>
                  {pick.staffPick && <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Staff pick</span>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{pick.author} · {pick.genre?.join(', ')}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pick.synopsis}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium block mb-1 ${STATUS_STYLES[pick.status]?.color}`}>
                  {STATUS_STYLES[pick.status]?.label}
                </span>
                {pick.latestChapter && (
                  <span className="text-xs text-gray-400">Ch. {pick.latestChapter}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No picks found 📚</div>
      )}
    </div>
  );
}

function MangaDetail({ pick, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-teal-600 mb-4 flex items-center gap-1 transition-colors"
      >
        ← Back to manga
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center text-4xl flex-shrink-0">
            🌿
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{pick.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{pick.author}</p>
            <div className="flex gap-2 flex-wrap mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[pick.status]?.color}`}>
                {STATUS_STYLES[pick.status]?.label}
              </span>
              {pick.genre?.map((g) => (
                <span key={g} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{g}</span>
              ))}
              {pick.staffPick && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">Staff pick</span>}
            </div>
          </div>
        </div>
        {pick.latestChapter && (
          <p className="text-xs text-gray-400 mb-3">Latest chapter: {pick.latestChapter}</p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed mb-4">{pick.synopsis}</p>
        {pick.externalUrl && (
          <a
            href={pick.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl hover:bg-teal-100 transition-all font-medium"
          >
            Read legally →
          </a>
        )}
      </div>
    </div>
  );
}
