// backend/seed.js — run once: node seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Songs
  await prisma.song.createMany({
    data: [
      { title: 'Unravel', artist: 'TK from Ling Tosite Sigure', anime: 'Tokyo Ghoul', genre: 'J-rock', duration: 242, playCount: 0 },
      { title: 'Gurenge', artist: 'LiSA', anime: 'Demon Slayer', genre: 'J-pop', duration: 234, playCount: 0 },
      { title: 'Renai Circulation', artist: 'Kana Hanazawa', anime: 'Bakemonogatari', genre: 'J-pop', duration: 198, playCount: 0 },
      { title: 'Again', artist: 'YUI', anime: 'Fullmetal Alchemist: Brotherhood', genre: 'Rock', duration: 216, playCount: 0 },
      { title: 'Hikaru Nara', artist: 'Goose House', anime: 'Your Lie in April', genre: 'Ballad', duration: 285, playCount: 0 },
      { title: 'Crossing Field', artist: 'LiSA', anime: 'Sword Art Online', genre: 'J-pop', duration: 227, playCount: 0 },
      { title: 'A Cruel Angel\'s Thesis', artist: 'Yoko Takahashi', anime: 'Neon Genesis Evangelion', genre: 'City pop', duration: 219, playCount: 0 },
      { title: 'My Dearest', artist: 'Supercell', anime: 'Guilty Crown', genre: 'Rock', duration: 258, playCount: 0 },
    ],
    skipDuplicates: true,
  });

  // Articles
  await prisma.article.createMany({
    data: [
      {
        title: 'Why Frieren Changed Anime Forever',
        slug: 'why-frieren-changed-anime-forever',
        excerpt: 'A deep dive into how Frieren: Beyond Journey\'s End redefined what a fantasy anime can be.',
        content: 'Full article content here...',
        category: 'ANIME_REVIEW',
        tags: ['frieren', 'fantasy', 'review'],
        published: true,
        publishedAt: new Date(),
        views: 4820,
      },
      {
        title: 'Top 10 Anime OSTs Ranked by Fans',
        slug: 'top-10-anime-osts-ranked',
        excerpt: 'We asked 5,000 fans to rank their favourite anime soundtracks. Here\'s what they said.',
        content: 'Full article content here...',
        category: 'MUSIC',
        tags: ['ost', 'music', 'rankings'],
        published: true,
        publishedAt: new Date(),
        views: 3100,
      },
      {
        title: 'Studio Ghibli\'s Visual Language Explained',
        slug: 'studio-ghibli-visual-language',
        excerpt: 'What makes Ghibli films instantly recognisable? We break down their signature aesthetic.',
        content: 'Full article content here...',
        category: 'ANALYSIS',
        tags: ['ghibli', 'animation', 'analysis'],
        published: true,
        publishedAt: new Date(),
        views: 2750,
      },
    ],
    skipDuplicates: true,
  });

  // Manga picks
  await prisma.mangaPick.createMany({
    data: [
      { title: 'Berserk', author: 'Kentaro Miura', genre: ['Dark fantasy', 'Action'], status: 'ONGOING', latestChapter: 374, synopsis: 'A mercenary swordsman pursues revenge against a former ally.', staffPick: true, isFeatured: true },
      { title: 'Vinland Saga', author: 'Makoto Yukimura', genre: ['Historical', 'Action'], status: 'ONGOING', latestChapter: 210, synopsis: 'A young warrior seeks revenge for his father\'s death in Viking-age Europe.', isFeatured: false },
      { title: 'Dungeon Meshi', author: 'Ryoko Kui', genre: ['Fantasy', 'Comedy'], status: 'COMPLETED', latestChapter: 97, synopsis: 'An adventurer explores a dungeon and cooks the monsters he encounters.', isFeatured: true },
      { title: 'Chainsaw Man', author: 'Tatsuki Fujimoto', genre: ['Action', 'Horror'], status: 'ONGOING', latestChapter: 180, synopsis: 'A boy merges with his devil dog to become a chainsaw-wielding devil hunter.', isFeatured: false },
    ],
    skipDuplicates: true,
  });

  // Exclusive content
  await prisma.exclusiveContent.createMany({
    data: [
      { title: 'Voice Actor Interview — Kana Hanazawa', description: 'Exclusive sit-down on her role in Frieren and her career journey', type: 'INTERVIEW', duration: 1080, isMembersOnly: true, published: true },
      { title: 'Behind the Music — Yuki Kajiura', description: 'How she composed the Madoka Magica and SAO soundtracks', type: 'MUSIC_BREAKDOWN', duration: 1440, isMembersOnly: true, published: true },
      { title: 'Studio Tour — Inside Ufotable', description: 'A rare look at the studio that brought Demon Slayer to life', type: 'STUDIO_TOUR', duration: 600, isMembersOnly: false, published: true },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
