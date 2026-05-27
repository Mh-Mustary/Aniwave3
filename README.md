# AnimeWave 🌸

An anime community radio platform with live voting, manga picks, news, and exclusive content.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend API | Node.js + Express |
| Database | PostgreSQL (via Prisma ORM) |
| Real-time | Socket.IO (live votes + chat) |
| Auth | NextAuth.js (Google + Discord OAuth) |
| Storage | Cloudinary (images/audio thumbnails) |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

---

## Project Structure

```
animewave/
├── backend/
│   ├── index.js
│   ├── routes/
│   │   ├── songs.js
│   │   ├── articles.js
│   │   ├── manga.js
│   │   └── chat.js
│   ├── models/schema.prisma
│   ├── middleware/auth.js
│   └── seed.js
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
└── docker-compose.yml
```

## Quick Start

1. `docker-compose up -d` — start Postgres
2. `cd backend && npm install && npx prisma migrate dev --name init && node seed.js`
3. `npm run dev` — start backend on :4000
4. `cd ../frontend && npm install && npm run dev` — start frontend on :3000

See README sections below for env vars and deployment.
