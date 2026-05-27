// ============================================================
// Radio — player controls + voting
// ============================================================

let songs = [];
let playing = false;
let shuffleOn = false;
let activeFilter = 'all';
let seekInterval = null;
let seekPct = 0;
let audio = null;

// ── API helpers ──────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = await getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(CONFIG.API_URL + path, { ...options, headers });
  return res.json();
}

// ── Songs & votes ────────────────────────────────────────────

async function loadSongs() {
  try {
    const data = await apiFetch('/songs');
    songs = data.songs || [];
    renderVotes();
    renderQueue();
  } catch {
    console.warn('Could not load songs from API — using demo data');
    songs = getDemoSongs();
    renderVotes();
    renderQueue();
  }
}

async function castVote(songId) {
  const user = await getCurrentUser();
  if (!user) { showAuthModal('login'); return; }
  try {
    await apiFetch(`/songs/${songId}/vote`, { method: 'POST' });
    await loadSongs();
  } catch (err) {
    console.error('Vote failed:', err);
  }
}

// ── Render: vote list ────────────────────────────────────────

function renderVotes() {
  const filtered = activeFilter === 'all'
    ? songs
    : songs.filter(s => s.genre === activeFilter);
  const maxVotes = Math.max(...songs.map(s => Number(s.vote_count) || 0), 1);
  const list = document.getElementById('voteList');
  if (!list) return;
  list.innerHTML = '';

  [...filtered]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .forEach((song, i) => {
      const pct = Math.round(((song.vote_count || 0) / maxVotes) * 100);
      const voted = song.user_has_voted;
      const isTop = i === 0 && activeFilter === 'all';

      const card = document.createElement('div');
      card.className = 'vote-card' + (isTop ? ' top' : '');
      card.dataset.id = song.id;
      card.innerHTML = `
        <div class="vote-card-inner">
          <div class="vote-rank">${isTop ? '<i class="ti ti-trophy"></i>' : i + 1}</div>
          <div class="vote-info">
            <div class="vote-title">${song.title}</div>
            <div class="vote-sub">${song.artist} · ${song.anime}</div>
          </div>
          <div class="vote-actions">
            <span class="vote-count">${song.vote_count || 0}</span>
            <button class="vote-btn ${voted ? 'voted' : ''}" onclick="castVote('${song.id}')">
              <i class="ti ti-heart" aria-hidden="true"></i>${voted ? 'Voted' : 'Vote'}
            </button>
          </div>
        </div>
        <div class="vbar-bg"><div class="vbar-fill" style="width:${pct}%;"></div></div>
      `;
      list.appendChild(card);
    });
}

// ── Render: queue ────────────────────────────────────────────

function renderQueue() {
  const el = document.getElementById('queueList');
  if (!el) return;
  el.innerHTML = '';
  const sorted = [...songs].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 5);
  sorted.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'queue-item';
    d.innerHTML = `
      <span class="queue-num">${i + 1}</span>
      <div class="queue-info">
        <div class="queue-title">${s.title}</div>
        <div class="queue-sub">${s.artist}</div>
      </div>
      <span class="queue-votes">${s.vote_count || 0} votes</span>
    `;
    el.appendChild(d);
  });
}

// ── Player controls ──────────────────────────────────────────

function initPlayer() {
  audio = new Audio(CONFIG.STREAM_URL);
  audio.crossOrigin = 'anonymous';

  document.getElementById('playBtn')?.addEventListener('click', togglePlay);
  document.getElementById('shuffleBtn')?.addEventListener('click', toggleShuffle);

  const vol = document.getElementById('volumeSlider');
  if (vol) {
    audio.volume = vol.value / 100;
    vol.addEventListener('input', () => { audio.volume = vol.value / 100; });
  }

  // Simulate seek progress (real radio streams don't have duration)
  startSeekSimulation();
}

function togglePlay() {
  playing = !playing;
  const icon = document.getElementById('playIcon');
  const waveform = document.getElementById('waveform');

  if (playing) {
    audio?.play().catch(() => { playing = false; });
    icon && (icon.className = 'ti ti-player-pause');
    waveform?.querySelectorAll('.wave-bar').forEach(b => b.classList.add('active'));
  } else {
    audio?.pause();
    icon && (icon.className = 'ti ti-player-play');
    waveform?.querySelectorAll('.wave-bar').forEach(b => b.classList.remove('active'));
  }
}

function toggleShuffle() {
  shuffleOn = !shuffleOn;
  const btn = document.getElementById('shuffleBtn');
  if (btn) {
    btn.style.color = shuffleOn ? '#D4537E' : '';
    btn.style.background = shuffleOn ? '#FBEAF0' : '';
  }
}

function startSeekSimulation() {
  // For a live stream, we fake the progress as a visual indicator
  // showing position within the current song
  setInterval(() => {
    if (!playing) return;
    seekPct = (seekPct + 0.05) % 100;
    const fill = document.getElementById('seekFill');
    if (fill) fill.style.width = seekPct.toFixed(1) + '%';
    const elapsed = Math.round((seekPct / 100) * 240);
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    const ct = document.getElementById('currentTime');
    if (ct) ct.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }, 300);
}

// ── Filter ───────────────────────────────────────────────────

function filterVotes(genre, btn) {
  activeFilter = genre;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderVotes();
}

// ── Stats ─────────────────────────────────────────────────────

async function loadStats() {
  try {
    const data = await apiFetch('/songs/stats');
    renderBarChart(data.listener_history || []);
    const stat2 = document.getElementById('stat2');
    if (stat2) stat2.textContent = (data.total_votes_today || 0).toLocaleString();
    const stat3 = document.getElementById('stat3');
    if (stat3) stat3.textContent = data.songs_played_today || 0;
  } catch {
    renderBarChart([]);
  }
}

function renderBarChart(history) {
  const vals = history.length
    ? history.map(h => h.listener_count)
    : [420, 580, 710, 930, 1050, 1180, 1240, 1284];
  const max = Math.max(...vals, 1);
  const bc = document.getElementById('barChart');
  if (!bc) return;
  bc.innerHTML = '';
  vals.forEach((v, i) => {
    const pct = Math.round((v / max) * 100);
    const isLast = i === vals.length - 1;
    const d = document.createElement('div');
    d.className = 'stat-bar' + (isLast ? ' stat-bar-latest' : '');
    d.style.height = pct + '%';
    bc.appendChild(d);
  });
}

// ── Live listener count (simulated tick) ─────────────────────

function startListenerTick(base = 1284) {
  let count = base;
  setInterval(() => {
    count += Math.floor(Math.random() * 7) - 3;
    count = Math.max(1100, count);
    const el = document.getElementById('listenerCount');
    const stat1 = document.getElementById('stat1');
    if (el) el.textContent = count.toLocaleString() + ' listening';
    if (stat1) stat1.textContent = count.toLocaleString();
  }, 3000);
}

// ── Countdown to next song ────────────────────────────────────

function startCountdown(seconds = 180) {
  let s = seconds;
  const el = document.getElementById('countdown');
  setInterval(() => {
    if (s <= 0) { s = 180; }
    s--;
    if (!el) return;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    el.textContent = `${m}:${String(sec).padStart(2, '0')}`;
  }, 1000);
}

// ── Demo data (used if API is not running) ───────────────────

function getDemoSongs() {
  return [
    { id: '1', title: 'Gurenge', artist: 'LiSA', anime: 'Demon Slayer OP', genre: 'J-pop', vote_count: 312, user_has_voted: false },
    { id: '2', title: 'Renai Circulation', artist: 'Kana Hanazawa', anime: 'Bakemonogatari', genre: 'J-pop', vote_count: 278, user_has_voted: false },
    { id: '3', title: 'Again', artist: 'YUI', anime: 'FMA: Brotherhood OP', genre: 'Rock', vote_count: 241, user_has_voted: false },
    { id: '4', title: 'My Dearest', artist: 'Supercell', anime: 'Guilty Crown OP', genre: 'Rock', vote_count: 198, user_has_voted: false },
    { id: '5', title: 'Hikaru Nara', artist: 'Goose House', anime: 'Your Lie in April', genre: 'Ballad', vote_count: 165, user_has_voted: false },
    { id: '6', title: 'Crossing Field', artist: 'LiSA', anime: 'Sword Art Online OP', genre: 'J-pop', vote_count: 133, user_has_voted: false },
  ];
}

// ── Chat (local only — replace with Supabase Realtime later) ──

const chatMessages = [
  { name: 'sakura_fan', text: 'this song is so good 🌸', self: false },
  { name: 'otaku99', text: 'voted for Gurenge!!', self: false },
  { name: 'mikazuki', text: 'love this station 💜', self: false },
];

function renderChat() {
  const box = document.getElementById('chatBox');
  if (!box) return;
  box.innerHTML = '';
  chatMessages.slice(-20).forEach(m => {
    const d = document.createElement('div');
    d.className = 'chat-row ' + (m.self ? 'chat-row-self' : '');
    d.innerHTML = `
      <div class="chat-name">${m.name}</div>
      <div class="chat-bubble ${m.self ? 'chat-self' : 'chat-other'}">${m.text}</div>
    `;
    box.appendChild(d);
  });
  box.scrollTop = box.scrollHeight;
}

function sendChat() {
  const inp = document.getElementById('chatInput');
  if (!inp) return;
  const txt = inp.value.trim();
  if (!txt) return;
  chatMessages.push({ name: 'You', text: txt, self: true });
  inp.value = '';
  renderChat();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'chatInput') sendChat();
});
