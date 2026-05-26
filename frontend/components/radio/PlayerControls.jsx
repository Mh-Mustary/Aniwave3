// frontend/components/radio/PlayerControls.jsx
'use client';
import { useState, useEffect, useRef } from 'react';

export default function PlayerControls({ nowPlaying, listeners }) {
  const [playing, setPlaying] = useState(false);
  const [seekPct, setSeekPct] = useState(0);
  const [volume, setVolume] = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const tickRef = useRef(null);

  useEffect(() => {
    if (playing) {
      tickRef.current = setInterval(() => {
        setSeekPct((p) => {
          if (p >= 100) { clearInterval(tickRef.current); return 100; }
          return p + 100 / ((nowPlaying?.duration || 240) * 5);
        });
      }, 200);
    } else {
      clearInterval(tickRef.current);
    }
    return () => clearInterval(tickRef.current);
  }, [playing, nowPlaying]);

  const elapsed = nowPlaying ? Math.round((seekPct / 100) * nowPlaying.duration) : 0;
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">Now playing</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          <span className="text-xs text-gray-500">{listeners.toLocaleString()} listening</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        {/* Album art placeholder */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-100">
          🎵
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{nowPlaying?.title || '—'}</p>
          <p className="text-sm text-gray-500 truncate mt-0.5">{nowPlaying?.artist}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {nowPlaying?.anime && (
              <span className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
                {nowPlaying.anime}
              </span>
            )}
            {nowPlaying?.genre && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                {nowPlaying.genre}
              </span>
            )}
          </div>
        </div>

        {/* Waveform */}
        {playing && (
          <div className="flex items-end gap-0.5 h-8 flex-shrink-0" aria-hidden="true">
            {[6, 14, 10, 22, 8, 18, 12, 6].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-sm bg-pink-400"
                style={{ height: `${h}px`, animation: `wave 1s ease-in-out ${i * 0.08}s infinite alternate` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Seek bar */}
      <div className="mb-3">
        <div className="h-1 rounded-full bg-gray-100 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setSeekPct(((e.clientX - rect.left) / rect.width) * 100);
        }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${seekPct.toFixed(1)}%`, background: 'linear-gradient(90deg, #ED93B1, #AFA9EC)' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{fmtTime(elapsed)}</span>
          <span className="text-xs text-gray-400">{fmtTime(nowPlaying?.duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
              shuffle ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-pink-500'
            }`}
            aria-label="Shuffle"
          >⇌</button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors" aria-label="Previous">⏮</button>
        </div>

        <button
          onClick={() => setPlaying(!playing)}
          className="w-12 h-12 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 text-xl hover:bg-pink-100 transition-all"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors" aria-label="Next">⏭</button>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">🔈</span>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={(e) => setVolume(+e.target.value)}
              className="w-16 accent-pink-400"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}
