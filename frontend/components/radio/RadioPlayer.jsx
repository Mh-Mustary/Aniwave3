// frontend/components/radio/RadioPlayer.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../lib/useSocket';
import { api } from '../../lib/api';
import VoteList from './VoteList';
import LiveChat from './LiveChat';
import PlayerControls from './PlayerControls';

export default function RadioPlayer({ initialSongs = [], user }) {
  const [songs, setSongs] = useState(initialSongs);
  const [nowPlaying, setNowPlaying] = useState(initialSongs[0] || null);
  const [voteCounts, setVoteCounts] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [listeners, setListeners] = useState(0);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [countdownSecs, setCountdownSecs] = useState(300);
  const countdownRef = useRef(null);

  const { castVote, sendChat } = useSocket({
    onVotesUpdated: ({ voteCounts: vc }) => setVoteCounts(vc),
    onVotesReset: () => {
      setUserVotes({});
      setVoteCounts({});
      setCountdownSecs(300);
    },
    onSongNext: (song) => {
      setNowPlaying(song);
      setHistory((h) => [song, ...h].slice(0, 10));
    },
    onListeners: ({ count }) => setListeners(count),
  });

  useEffect(() => {
    api.getHistory().then((h) => setHistory(h.map((ph) => ph.song))).catch(() => {});
  }, []);

  // Local countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdownSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, []);

  function handleVote(songId) {
    if (!user) return alert('Please log in to vote!');
    const isVoted = userVotes[songId];
    setUserVotes((v) => {
      const next = { ...v };
      if (isVoted) delete next[songId];
      else next[songId] = true;
      return next;
    });
    setVoteCounts((vc) => ({
      ...vc,
      [songId]: Math.max(0, (vc[songId] || 0) + (isVoted ? -1 : 1)),
    }));
    castVote({ songId, userId: user.id, sessionId: null });
  }

  const genres = ['all', ...new Set(songs.map((s) => s.genre))];
  const filteredSongs = filter === 'all' ? songs : songs.filter((s) => s.genre === filter);
  const sortedSongs = [...filteredSongs].sort(
    (a, b) => (voteCounts[b.id] || b.votes || 0) - (voteCounts[a.id] || a.votes || 0)
  );
  const mins = Math.floor(countdownSecs / 60);
  const secs = String(countdownSecs % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      {/* Now Playing */}
      <PlayerControls nowPlaying={nowPlaying} listeners={listeners} />

      {/* Vote section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-pink-500 flex items-center gap-1">
            🔥 Vote for next song
          </h2>
          <span className="text-xs text-gray-400">
            Next in <span className="font-medium text-pink-400">{mins}:{secs}</span>
          </span>
        </div>

        {/* Genre filters */}
        <div className="flex gap-2 flex-wrap mb-3">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                filter === g
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'border-gray-200 text-gray-500 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <VoteList
          songs={sortedSongs}
          voteCounts={voteCounts}
          userVotes={userVotes}
          onVote={handleVote}
        />

        <div className="flex justify-end mt-2">
          <button className="text-xs text-pink-400 hover:text-pink-600 transition-colors">
            + Suggest a song
          </button>
        </div>
      </div>

      {/* Queue + Chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            📋 Up next
          </h3>
          <div className="space-y-2">
            {sortedSongs.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 py-1">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 truncate">{s.artist}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {voteCounts[s.id] || s.votes || 0} votes
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Chat */}
        <LiveChat user={user} sendChat={sendChat} />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">🕐 Recently played</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {history.map((s, i) => (
              <div
                key={`${s.id}-${i}`}
                className="bg-white border border-gray-100 rounded-xl px-3 py-2 min-w-[140px] flex-shrink-0"
              >
                <p className="text-xs font-medium text-gray-800 truncate">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{s.anime}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
