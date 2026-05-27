// backend/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const songsRouter = require('./routes/songs');
const articlesRouter = require('./routes/articles');
const mangaRouter = require('./routes/manga');
const chatRouter = require('./routes/chat');
const exclusiveRouter = require('./routes/exclusive');
const authRouter = require('./routes/auth');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

let currentCycleId = `cycle_${Date.now()}`;
let voteCounts = {};
let listenerCount = 0;

// Reset votes and advance song every 5 min
function startVoteCycle() {
  return setTimeout(async () => {
    const winner = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0];
    if (winner) {
      const [songId] = winner;
      await prisma.playHistory.create({ data: { songId, listeners: listenerCount } }).catch(() => {});
      await prisma.song.update({ where: { id: songId }, data: { playCount: { increment: 1 } } }).catch(() => {});
      const song = await prisma.song.findUnique({ where: { id: songId } }).catch(() => null);
      if (song) io.emit('song:next', song);
    }
    currentCycleId = `cycle_${Date.now()}`;
    voteCounts = {};
    await prisma.vote.deleteMany({}).catch(() => {});
    io.emit('votes:reset', { cycleId: currentCycleId });
    startVoteCycle();
  }, 5 * 60 * 1000);
}
startVoteCycle();

setInterval(() => io.emit('stats:listeners', { count: listenerCount }), 10000);

io.on('connection', (socket) => {
  listenerCount++;
  io.emit('stats:listeners', { count: listenerCount });

  socket.on('vote:cast', async ({ songId, userId, sessionId }) => {
    try {
      const existing = await prisma.vote.findFirst({ where: { songId, userId } });
      if (existing) {
        await prisma.vote.delete({ where: { id: existing.id } });
        voteCounts[songId] = Math.max(0, (voteCounts[songId] || 1) - 1);
      } else {
        await prisma.vote.create({ data: { songId, userId, sessionId, cycleId: currentCycleId } });
        voteCounts[songId] = (voteCounts[songId] || 0) + 1;
      }
      io.emit('votes:updated', { voteCounts, cycleId: currentCycleId });
    } catch (err) {
      socket.emit('vote:error', { message: err.message });
    }
  });

  socket.on('chat:send', async ({ userId, message }) => {
    if (!message || message.length > 200) return;
    try {
      const saved = await prisma.chatMessage.create({
        data: { userId, message },
        include: { user: { select: { username: true, avatarUrl: true } } },
      });
      io.emit('chat:message', saved);
    } catch {}
  });

  socket.on('disconnect', () => {
    listenerCount = Math.max(0, listenerCount - 1);
    io.emit('stats:listeners', { count: listenerCount });
  });
});

app.set('io', io);
app.set('voteCounts', () => voteCounts);
app.set('cycleId', () => currentCycleId);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.set('trust proxy', 1);
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api/auth', authRouter);
app.use('/api/songs', songsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/manga', mangaRouter);
app.use('/api/chat', chatRouter);
app.use('/api/exclusive', exclusiveRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', listeners: listenerCount }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`AnimeWave backend running on :${PORT}`));
