// frontend/app/HomeClient.jsx
'use client';
import { useState, useEffect } from 'react';
import RadioPlayer from '../components/radio/RadioPlayer';
import ArticleGrid from '../components/news/ArticleGrid';
import MangaSection from '../components/manga/MangaSection';
import ExclusiveSection from '../components/exclusive/ExclusiveSection';

const SECTIONS = [
  { id: 'radio', label: 'Radio', emoji: '📻' },
  { id: 'anime', label: 'Anime', emoji: '✨' },
  { id: 'manga', label: 'Manga', emoji: '📚' },
  { id: 'news', label: 'News', emoji: '📰' },
  { id: 'exclusive', label: 'Exclusive', emoji: '⭐' },
];

export default function HomeClient({ songs, articles, manga, exclusive }) {
  const [section, setSection] = useState('radio');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('aw_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem('aw_user', JSON.stringify(userData));
    setShowAuth(false);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('aw_user');
    localStorage.removeItem('aw_token');
  }

  // Split articles: news vs anime articles
  const newsArticles = articles.filter((a) => a.category === 'NEWS');
  const animeArticles = articles.filter((a) => a.category !== 'NEWS');

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background-tertiary, #faf9f7)' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <span className="font-medium text-gray-900 text-base">🌸 AnimeWave</span>
            <span className="text-xs text-gray-400 ml-2 hidden sm:inline">Your anime radio & community</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Logout</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1.5 rounded-xl hover:bg-pink-100 transition-all font-medium"
              >
                Login / Sign up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Nav tabs */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`flex items-center gap-1.5 text-sm px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                section === s.id
                  ? 'border-pink-400 text-pink-600 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {section === 'radio' && <RadioPlayer initialSongs={songs} user={user} />}
        {section === 'anime' && (
          <div>
            <h2 className="text-base font-medium text-gray-800 mb-4">Anime articles</h2>
            <ArticleGrid articles={animeArticles.length ? animeArticles : articles} />
          </div>
        )}
        {section === 'manga' && (
          <div>
            <h2 className="text-base font-medium text-gray-800 mb-4">Manga picks</h2>
            <MangaSection picks={manga} />
          </div>
        )}
        {section === 'news' && (
          <div>
            <h2 className="text-base font-medium text-gray-800 mb-4">Latest news</h2>
            <ArticleGrid articles={newsArticles.length ? newsArticles : articles} />
          </div>
        )}
        {section === 'exclusive' && (
          <div>
            <h2 className="text-base font-medium text-gray-800 mb-4">Exclusive moments</h2>
            <ExclusiveSection content={exclusive} isLoggedIn={!!user} />
          </div>
        )}
      </main>

      {/* Auth modal */}
      {showAuth && <AuthModal onLogin={handleLogin} onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ─── Simple Auth Modal ────────────────────────────────────────────────────────
import { api } from '../lib/api';

function AuthModal({ onLogin, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const res = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      localStorage.setItem('aw_token', res.token);
      onLogin(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-medium text-gray-900 mb-4 text-center">
          {mode === 'login' ? '🌸 Welcome back' : '✨ Join AnimeWave'}
        </h3>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
          />
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-300"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-sm bg-pink-50 text-pink-700 border border-pink-200 py-2.5 rounded-xl font-medium hover:bg-pink-100 transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-pink-500 hover:text-pink-700"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
