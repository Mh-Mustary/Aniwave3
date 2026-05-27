-- ============================================================
-- AnimeWave Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SONGS + VOTING
-- ============================================================

create table songs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text not null,
  anime text not null,
  genre text not null,
  cover_url text,
  stream_url text,
  duration_seconds integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table votes (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid references songs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  created_at timestamptz default now(),
  unique(song_id, user_id)
);

-- Vote counts view (fast read)
create view song_vote_counts as
  select
    s.id,
    s.title,
    s.artist,
    s.anime,
    s.genre,
    s.cover_url,
    s.stream_url,
    s.duration_seconds,
    s.is_active,
    count(v.id) as vote_count
  from songs s
  left join votes v on v.song_id = s.id
  group by s.id
  order by vote_count desc;

-- ============================================================
-- RADIO QUEUE + HISTORY
-- ============================================================

create table radio_queue (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid references songs(id) on delete cascade,
  position integer not null,
  is_playing boolean default false,
  queued_at timestamptz default now()
);

create table play_history (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid references songs(id) on delete set null,
  played_at timestamptz default now(),
  listener_count integer default 0
);

-- ============================================================
-- ARTICLES (anime + news)
-- ============================================================

create table articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text,
  body text,
  cover_url text,
  category text not null check (category in ('anime', 'news', 'music', 'review', 'list', 'analysis')),
  tags text[] default '{}',
  author_id uuid references auth.users(id) on delete set null,
  is_published boolean default false,
  view_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- MANGA
-- ============================================================

create table manga (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text,
  genre text,
  status text check (status in ('ongoing', 'completed', 'hiatus')),
  cover_url text,
  description text,
  latest_chapter integer,
  mal_id integer,
  is_staff_pick boolean default false,
  is_trending boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- EXCLUSIVE CONTENT
-- ============================================================

create table exclusive_content (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  content_type text check (content_type in ('interview', 'behind_scenes', 'studio_tour', 'music', 'other')),
  cover_url text,
  video_url text,
  duration_seconds integer,
  is_members_only boolean default true,
  view_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- LISTENER STATS
-- ============================================================

create table listener_stats (
  id uuid primary key default uuid_generate_v4(),
  listener_count integer not null,
  recorded_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table votes enable row level security;
alter table articles enable row level security;
alter table exclusive_content enable row level security;

-- Anyone can read published articles
create policy "Public articles are viewable by all"
  on articles for select
  using (is_published = true);

-- Anyone can read songs
create policy "Songs are public"
  on songs for select
  using (true);

-- Authenticated users can vote
create policy "Authenticated users can vote"
  on votes for insert
  with check (auth.uid() = user_id);

-- Users can delete their own vote
create policy "Users can remove own vote"
  on votes for delete
  using (auth.uid() = user_id);

-- Users can see their own votes
create policy "Users can see own votes"
  on votes for select
  using (auth.uid() = user_id);

-- Members-only exclusive content (free previews are public)
create policy "Free exclusive content is public"
  on exclusive_content for select
  using (is_members_only = false);

create policy "Members can see all exclusive content"
  on exclusive_content for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME
-- ============================================================

-- Enable realtime on votes table so frontend gets live updates
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table radio_queue;
alter publication supabase_realtime add table listener_stats;

-- ============================================================
-- SEED DATA
-- ============================================================

insert into songs (title, artist, anime, genre, duration_seconds) values
  ('Unravel', 'TK from Ling Tosite Sigure', 'Tokyo Ghoul OP', 'J-rock', 242),
  ('Gurenge', 'LiSA', 'Demon Slayer OP', 'J-pop', 232),
  ('A Cruel Angel''s Thesis', 'Yoko Takahashi', 'Neon Genesis Evangelion OP', 'City pop', 218),
  ('Renai Circulation', 'Kana Hanazawa', 'Bakemonogatari ED', 'J-pop', 265),
  ('Again', 'YUI', 'Fullmetal Alchemist: Brotherhood OP', 'Rock', 225),
  ('Hikaru Nara', 'Goose House', 'Your Lie in April OP', 'Ballad', 272),
  ('My Dearest', 'Supercell', 'Guilty Crown OP', 'J-pop', 294),
  ('Silhouette', 'KANA-BOON', 'Naruto Shippuden OP', 'Rock', 241),
  ('Crossing Field', 'LiSA', 'Sword Art Online OP', 'J-pop', 249),
  ('Zankoku na Tenshi no Teeze', 'Yoko Takahashi', 'Evangelion OP', 'City pop', 218);

insert into manga (title, author, genre, status, latest_chapter, is_staff_pick, is_trending) values
  ('Berserk', 'Kentaro Miura', 'Dark fantasy', 'ongoing', 374, true, false),
  ('Vinland Saga', 'Makoto Yukimura', 'Historical', 'ongoing', 210, false, true),
  ('Dungeon Meshi', 'Ryoko Kui', 'Fantasy', 'completed', 97, false, false),
  ('Chainsaw Man', 'Tatsuki Fujimoto', 'Action', 'ongoing', 180, false, true),
  ('Frieren: Beyond Journey''s End', 'Kanehito Yamada', 'Fantasy', 'ongoing', 118, true, true),
  ('Blue Period', 'Tsubasa Yamaguchi', 'Slice of life', 'ongoing', 19, true, false);

insert into articles (title, slug, excerpt, category, is_published) values
  ('Why Frieren changed anime forever', 'why-frieren-changed-anime-forever', 'A deep dive into the quiet revolution of Frieren: Beyond Journey''s End.', 'review', true),
  ('Top 10 slice-of-life anime of all time', 'top-10-slice-of-life-anime', 'From K-On to Barakamon, the definitive comfort watch ranking.', 'list', true),
  ('The best anime OSTs ranked by fans', 'best-anime-osts-ranked', 'Yuki Kajiura, Hiroyuki Sawano, Joe Hisaishi — who wins?', 'music', true),
  ('Studio Ghibli''s visual language explained', 'ghibli-visual-language', 'What makes every Ghibli frame feel like a painting.', 'analysis', true),
  ('MAPPA announces Attack on Titan final OVA', 'mappa-aot-final-ova-2026', 'The studio confirms a theatrical release for the final chapter adaptation.', 'news', true),
  ('Yoasobi drops surprise anime-only EP', 'yoasobi-anime-ep-2026', 'Five new tracks, each tied to a different anime series.', 'news', true);

insert into exclusive_content (title, description, content_type, duration_seconds, is_members_only) values
  ('Voice actor interview — Kana Hanazawa', 'Exclusive sit-down on her role in Frieren and her career journey.', 'interview', 1080, true),
  ('Behind the music — Yuki Kajiura', 'How she composed the Madoka Magica and SAO soundtracks.', 'behind_scenes', 1440, true),
  ('Studio tour — inside Ufotable', 'A rare look at the studio that brought Demon Slayer to life.', 'studio_tour', 600, false);
