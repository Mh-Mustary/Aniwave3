// ============================================================
// Sections — Articles, Manga, News, Exclusive
// ============================================================

const CATEGORY_TAGS = {
  anime: { label: 'Anime', cls: 'tag-purple' },
  news: { label: 'News', cls: 'tag-pink' },
  music: { label: 'Music', cls: 'tag-teal' },
  review: { label: 'Review', cls: 'tag-purple' },
  list: { label: 'List', cls: 'tag-pink' },
  analysis: { label: 'Analysis', cls: 'tag-amber' },
};

const CONTENT_ICONS = {
  interview: '🎤',
  behind_scenes: '🎼',
  studio_tour: '📽',
  music: '🎵',
  other: '⭐',
};

// ── Articles ─────────────────────────────────────────────────

async function loadArticles(category = null) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-text">Loading articles...</div>';

  try {
    const qs = category ? `?category=${category}` : '';
    const data = await apiFetch('/articles' + qs);
    renderArticles(data.articles || []);
  } catch {
    renderArticles(getDemoArticles());
  }
}

function renderArticles(articles) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  if (!articles.length) { grid.innerHTML = '<div class="loading-text">No articles found.</div>'; return; }
  grid.innerHTML = '';
  articles.forEach(a => {
    const tag = CATEGORY_TAGS[a.category] || { label: a.category, cls: 'tag-purple' };
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-thumb" style="background: var(--color-background-secondary);">
        ${a.cover_url ? `<img src="${a.cover_url}" alt="${a.title}" style="width:100%;height:100%;object-fit:cover;">` : '📰'}
      </div>
      <div class="article-body">
        <div class="article-title">${a.title}</div>
        <div class="article-excerpt">${a.excerpt || ''}</div>
        <div class="article-footer">
          <span class="pastel-tag ${tag.cls}">${tag.label}</span>
          <span class="article-date">${formatDate(a.created_at)}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterArticles(category, btn) {
  document.querySelectorAll('#articlesFilters .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadArticles(category === 'all' ? null : category);
}

// ── Manga ─────────────────────────────────────────────────────

async function loadManga() {
  const list = document.getElementById('mangaList');
  if (!list) return;
  list.innerHTML = '<div class="loading-text">Loading manga...</div>';

  try {
    const data = await apiFetch('/manga');
    renderManga(data.manga || []);
  } catch {
    renderManga(getDemoManga());
  }
}

function renderManga(mangaList) {
  const el = document.getElementById('mangaList');
  if (!el) return;
  if (!mangaList.length) { el.innerHTML = '<div class="loading-text">No manga found.</div>'; return; }
  el.innerHTML = '';
  mangaList.forEach(m => {
    let badge = '';
    if (m.is_staff_pick) badge = '<span class="pastel-tag tag-pink">Staff pick</span>';
    else if (m.is_trending) badge = '<span class="pastel-tag tag-purple">Trending</span>';
    else if (m.status === 'completed') badge = '<span class="pastel-tag tag-teal">Completed</span>';
    else badge = '<span class="pastel-tag tag-amber">Ongoing</span>';

    const card = document.createElement('div');
    card.className = 'manga-card';
    card.innerHTML = `
      <div class="manga-cover" style="background: var(--color-background-secondary);">
        ${m.cover_url ? `<img src="${m.cover_url}" alt="${m.title}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : '📚'}
      </div>
      <div class="manga-info">
        <div class="manga-title">${m.title}</div>
        <div class="manga-sub">${m.genre || ''} · ${m.status || ''}</div>
        <div style="margin-top:5px;">${badge}</div>
      </div>
      <div class="manga-chapter">Ch. ${m.latest_chapter || '?'}</div>
    `;
    el.appendChild(card);
  });
}

// ── News ──────────────────────────────────────────────────────

async function loadNews() {
  const list = document.getElementById('newsList');
  if (!list) return;
  list.innerHTML = '<div class="loading-text">Loading news...</div>';

  try {
    const data = await apiFetch('/articles?category=news');
    renderNews(data.articles || []);
  } catch {
    renderNews(getDemoNews());
  }
}

function renderNews(articles) {
  const el = document.getElementById('newsList');
  if (!el) return;
  if (!articles.length) { el.innerHTML = '<div class="loading-text">No news found.</div>'; return; }
  el.innerHTML = '';
  articles.forEach((a, i) => {
    const isBreaking = i === 0;
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-content">
        <div class="news-title">${a.title}</div>
        <div class="news-meta">
          ${formatRelativeDate(a.created_at)} ·
          <span class="pastel-tag ${isBreaking ? 'tag-pink' : 'tag-teal'}">${isBreaking ? 'Breaking' : 'News'}</span>
        </div>
      </div>
      <i class="ti ti-chevron-right news-arrow" aria-hidden="true"></i>
    `;
    el.appendChild(card);
  });
}

// ── Exclusive ─────────────────────────────────────────────────

async function loadExclusive() {
  const list = document.getElementById('exclusiveList');
  if (!list) return;
  list.innerHTML = '<div class="loading-text">Loading exclusive content...</div>';

  try {
    const data = await apiFetch('/exclusive');
    renderExclusive(data.exclusive || []);
  } catch {
    renderExclusive(getDemoExclusive());
  }
}

const EXCLUSIVE_THEMES = [
  { bg: '#FBEAF0', borderColor: '#F4C0D1', iconBg: '#F4C0D1', titleColor: '#72243E', textColor: '#993556', tagCls: 'tag-pink' },
  { bg: '#EEEDFE', borderColor: '#AFA9EC', iconBg: '#CCC9F2', titleColor: '#26215C', textColor: '#534AB7', tagCls: 'tag-purple' },
  { bg: '#E1F5EE', borderColor: '#5DCAA5', iconBg: '#9FE1CB', titleColor: '#04342C', textColor: '#0F6E56', tagCls: 'tag-teal' },
];

function renderExclusive(items) {
  const el = document.getElementById('exclusiveList');
  if (!el) return;
  el.innerHTML = '';
  items.forEach((item, i) => {
    const theme = EXCLUSIVE_THEMES[i % EXCLUSIVE_THEMES.length];
    const icon = CONTENT_ICONS[item.content_type] || '⭐';
    const canAccess = item.can_access !== false;
    const mins = item.duration_seconds ? Math.round(item.duration_seconds / 60) : '?';

    const card = document.createElement('div');
    card.className = 'exclusive-card';
    card.style.cssText = `background:${theme.bg};border-color:${theme.borderColor};`;
    card.innerHTML = `
      <div class="exclusive-icon" style="background:${theme.iconBg};">${icon}</div>
      <div class="exclusive-body">
        <div class="exclusive-title" style="color:${theme.titleColor};">${item.title}</div>
        <div class="exclusive-desc" style="color:${theme.textColor};">${item.description || ''}</div>
        <div class="exclusive-footer">
          <span class="pastel-tag ${theme.tagCls}">${canAccess ? (item.is_members_only ? 'Members only' : 'Free preview') : 'Members only'}</span>
          <span style="font-size:11px;color:${theme.textColor};">${mins} min</span>
          ${!canAccess ? `<button class="lock-btn" onclick="showAuthModal('signup')">🔒 Unlock</button>` : ''}
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}

// ── Section switching ─────────────────────────────────────────

const sectionLoaders = {
  radio: () => {},
  anime: () => loadArticles(),
  manga: () => loadManga(),
  news: () => loadNews(),
  exclusive: () => loadExclusive(),
};

let sectionLoaded = {};

function showSection(name) {
  ['radio', 'anime', 'manga', 'news', 'exclusive'].forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.style.display = s === name ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === name);
  });
  if (!sectionLoaded[name]) {
    sectionLoaders[name]?.();
    sectionLoaded[name] = true;
  }
}

// ── Utilities ─────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatRelativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Demo data ─────────────────────────────────────────────────

function getDemoArticles() {
  return [
    { id: '1', title: 'Why Frieren changed anime forever', excerpt: 'A deep dive into the quiet revolution of Frieren.', category: 'review', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: '2', title: 'Top 10 slice-of-life anime of all time', excerpt: 'From K-On to Barakamon, the definitive comfort watch ranking.', category: 'list', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: '3', title: 'The best anime OSTs ranked by fans', excerpt: 'Yuki Kajiura, Hiroyuki Sawano, Joe Hisaishi — who wins?', category: 'music', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: '4', title: "Studio Ghibli's visual language explained", excerpt: "What makes every Ghibli frame feel like a painting.", category: 'analysis', created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  ];
}

function getDemoManga() {
  return [
    { id: '1', title: 'Berserk', genre: 'Dark fantasy', status: 'ongoing', latest_chapter: 374, is_staff_pick: true },
    { id: '2', title: 'Vinland Saga', genre: 'Historical', status: 'ongoing', latest_chapter: 210, is_trending: true },
    { id: '3', title: 'Dungeon Meshi', genre: 'Fantasy', status: 'completed', latest_chapter: 97 },
    { id: '4', title: 'Chainsaw Man', genre: 'Action', status: 'ongoing', latest_chapter: 180, is_trending: true },
    { id: '5', title: "Frieren: Beyond Journey's End", genre: 'Fantasy', status: 'ongoing', latest_chapter: 118, is_staff_pick: true },
  ];
}

function getDemoNews() {
  return [
    { id: '1', title: 'MAPPA announces Attack on Titan final OVA for 2026', category: 'news', created_at: new Date().toISOString() },
    { id: '2', title: 'Yoasobi drops surprise anime-only EP with five new tracks', category: 'news', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: '3', title: 'Crunchyroll reveals summer 2026 simulcast lineup', category: 'news', created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: '4', title: 'Makoto Shinkai teases next film set in rural Japan', category: 'news', created_at: new Date(Date.now() - 86400000).toISOString() },
  ];
}

function getDemoExclusive() {
  return [
    { id: '1', title: 'Voice actor interview — Kana Hanazawa', description: 'Exclusive sit-down on her role in Frieren and her career journey.', content_type: 'interview', duration_seconds: 1080, is_members_only: true, can_access: false },
    { id: '2', title: 'Behind the music — Yuki Kajiura', description: 'How she composed the Madoka Magica and SAO soundtracks.', content_type: 'behind_scenes', duration_seconds: 1440, is_members_only: true, can_access: false },
    { id: '3', title: 'Studio tour — inside Ufotable', description: 'A rare look at the studio that brought Demon Slayer to life.', content_type: 'studio_tour', duration_seconds: 600, is_members_only: false, can_access: true },
  ];
}
