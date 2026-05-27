// frontend/components/exclusive/ExclusiveSection.jsx
'use client';
import { useState } from 'react';

const TYPE_STYLES = {
  INTERVIEW: { emoji: '🎤', color: 'from-pink-50 to-rose-50', tag: 'bg-pink-100 text-pink-800' },
  BEHIND_SCENES: { emoji: '🎬', color: 'from-purple-50 to-indigo-50', tag: 'bg-purple-100 text-purple-800' },
  STUDIO_TOUR: { emoji: '📽', color: 'from-teal-50 to-emerald-50', tag: 'bg-teal-100 text-teal-800' },
  MUSIC_BREAKDOWN: { emoji: '🎼', color: 'from-purple-50 to-violet-50', tag: 'bg-violet-100 text-violet-800' },
  LIVE_SESSION: { emoji: '🎸', color: 'from-amber-50 to-orange-50', tag: 'bg-amber-100 text-amber-800' },
};

function fmtDuration(secs) {
  if (!secs) return '';
  const m = Math.floor(secs / 60);
  return `${m} min`;
}

export default function ExclusiveSection({ content = [], isLoggedIn = false }) {
  const [preview, setPreview] = useState(null);

  const free = content.filter((c) => !c.isMembersOnly);
  const membersOnly = content.filter((c) => c.isMembersOnly);

  return (
    <div className="space-y-6">
      {/* Members CTA if not logged in */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-5 text-center">
          <div className="text-3xl mb-2">✨</div>
          <h3 className="text-sm font-medium text-purple-900 mb-1">Members-only content</h3>
          <p className="text-xs text-purple-600 mb-3">
            Sign up for free to unlock exclusive interviews, studio tours, and behind-the-scenes content.
          </p>
          <button className="text-sm bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors font-medium">
            Join AnimeWave free →
          </button>
        </div>
      )}

      {/* Free previews */}
      {free.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            🎁 Free previews
          </h3>
          <div className="space-y-3">
            {free.map((item) => (
              <ExclusiveCard key={item.id} item={item} onPlay={() => setPreview(item)} accessible />
            ))}
          </div>
        </div>
      )}

      {/* Members only */}
      {membersOnly.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            🔒 Members only
          </h3>
          <div className="space-y-3">
            {membersOnly.map((item) => (
              <ExclusiveCard
                key={item.id}
                item={item}
                onPlay={() => isLoggedIn ? setPreview(item) : alert('Join AnimeWave to access this!')}
                accessible={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-3 text-center">{TYPE_STYLES[preview.type]?.emoji}</div>
            <h3 className="text-base font-medium text-gray-900 mb-1">{preview.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{preview.description}</p>
            {preview.mediaUrl ? (
              <video src={preview.mediaUrl} controls className="w-full rounded-xl mb-3" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm mb-3">
                Media player would go here
              </div>
            )}
            <button
              onClick={() => setPreview(null)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExclusiveCard({ item, onPlay, accessible }) {
  const style = TYPE_STYLES[item.type] || TYPE_STYLES.INTERVIEW;

  return (
    <div className={`bg-gradient-to-br ${style.color} rounded-2xl border border-gray-100 p-4`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
          {style.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.tag}`}>
              {item.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            {item.isMembersOnly ? (
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                Members only
              </span>
            ) : (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                Free preview
              </span>
            )}
            {item.duration && (
              <span className="text-xs text-gray-400">{fmtDuration(item.duration)}</span>
            )}
          </div>
        </div>
        <button
          onClick={onPlay}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all ${
            accessible
              ? 'bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={accessible ? 'Play' : 'Members only'}
        >
          {accessible ? '▶' : '🔒'}
        </button>
      </div>
    </div>
  );
}
