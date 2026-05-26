// frontend/components/radio/VoteList.jsx
'use client';

export default function VoteList({ songs, voteCounts, userVotes, onVote }) {
  const maxVotes = Math.max(...songs.map((s) => voteCounts[s.id] || s.votes || 0), 1);

  return (
    <div className="space-y-2">
      {songs.map((song, i) => {
        const count = voteCounts[song.id] ?? song.votes ?? 0;
        const pct = Math.round((count / maxVotes) * 100);
        const voted = !!userVotes[song.id];
        const isTop = i === 0;

        return (
          <div
            key={song.id}
            className={`bg-white rounded-xl border px-4 py-3 transition-all ${
              isTop ? 'border-pink-300' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-xs font-medium min-w-[18px] ${isTop ? 'text-pink-500' : 'text-gray-400'}`}>
                  {isTop ? '🏆' : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist} · {song.anime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-500">{count}</span>
                <button
                  onClick={() => onVote(song.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    voted
                      ? 'bg-pink-50 text-pink-700 border-pink-300 font-medium'
                      : 'border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'
                  }`}
                >
                  {voted ? '♥ Voted' : '♡ Vote'}
                </button>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #ED93B1, #AFA9EC)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
