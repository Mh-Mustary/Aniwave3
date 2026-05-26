// frontend/components/news/ArticleGrid.jsx
'use client';
import { useState } from 'react';

const CATEGORY_LABELS = {
  ANIME_REVIEW: { label: 'Review', color: 'bg-purple-100 text-purple-800' },
  NEWS: { label: 'News', color: 'bg-pink-100 text-pink-800' },
  MUSIC: { label: 'Music', color: 'bg-teal-100 text-teal-800' },
  ANALYSIS: { label: 'Analysis', color: 'bg-amber-100 text-amber-800' },
  INTERVIEW: { label: 'Interview', color: 'bg-blue-100 text-blue-800' },
  LIST: { label: 'List', color: 'bg-emerald-100 text-emerald-800' },
};

const CATEGORY_EMOJI = {
  ANIME_REVIEW: '✨', NEWS: '📰', MUSIC: '🎵', ANALYSIS: '🔍', INTERVIEW: '🎤', LIST: '📋',
};

const CATEGORY_BG = {
  ANIME_REVIEW: 'from-purple-50 to-pink-50',
  NEWS: 'from-pink-50 to-rose-50',
  MUSIC: 'from-teal-50 to-emerald-50',
  ANALYSIS: 'from-amber-50 to-yellow-50',
  INTERVIEW: 'from-blue-50 to-indigo-50',
  LIST: 'from-emerald-50 to-teal-50',
};

const CATEGORIES = ['All', 'ANIME_REVIEW', 'NEWS', 'MUSIC', 'ANALYSIS', 'INTERVIEW', 'LIST'];

export default function ArticleGrid({ articles = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === c
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              {c === 'All' ? 'All' : CATEGORY_LABELS[c]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured article (first) */}
      {filtered[0] && (
        <div className={`rounded-2xl border border-gray-100 overflow-hidden mb-4 bg-gradient-to-br ${CATEGORY_BG[filtered[0].category] || 'from-pink-50 to-purple-50'}`}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_LABELS[filtered[0].category]?.color}`}>
                    {CATEGORY_LABELS[filtered[0].category]?.label}
                  </span>
                  <span className="text-xs text-gray-400">{fmtDate(filtered[0].publishedAt)}</span>
                </div>
                <h2 className="text-base font-medium text-gray-900 mb-1">{filtered[0].title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-gray-400">{(filtered[0].views || 0).toLocaleString()} views</span>
                  <button className="text-xs text-pink-500 hover:text-pink-700 font-medium transition-colors">
                    Read more →
                  </button>
                </div>
              </div>
              <div className="text-4xl flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-gray-100">
                {CATEGORY_EMOJI[filtered[0].category]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(1).map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-pink-200 transition-all cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className={`h-24 flex items-center justify-center text-3xl bg-gradient-to-br ${CATEGORY_BG[article.category] || 'from-pink-50 to-purple-50'}`}>
              {article.coverUrl
                ? <img src={article.coverUrl} alt={article.title} className="w-full h-full object-cover" />
                : CATEGORY_EMOJI[article.category]
              }
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_LABELS[article.category]?.color}`}>
                  {CATEGORY_LABELS[article.category]?.label}
                </span>
                <span className="text-xs text-gray-400">{fmtDate(article.publishedAt)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{(article.views || 0).toLocaleString()} views</span>
                {article.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="text-xs text-gray-400">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No articles found. Try a different filter 🌸
        </div>
      )}
    </div>
  );
}
