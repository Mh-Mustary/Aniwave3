// backend/routes/songs.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/songs — list all active songs with current vote counts
router.get('/', async (req, res, next) => {
  try {
    const { genre, search, limit = 20, offset = 0 } = req.query;
    const getVoteCounts = req.app.get('voteCounts');
    const voteCounts = getVoteCounts();

    const where = {
      isActive: true,
      ...(genre && { genre }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { artist: { contains: search, mode: 'insensitive' } },
          { anime: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const songs = await prisma.song.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { playCount: 'desc' },
    });

    // Merge live vote counts
    const enriched = songs.map((s) => ({
      ...s,
      votes: voteCounts[s.id] || 0,
    }));

    // Sort by live votes
    enriched.sort((a, b) => b.votes - a.votes);

    res.json({ songs: enriched, cycleId: req.app.get('cycleId')() });
  } catch (err) {
    next(err);
  }
});

// GET /api/songs/history — recently played
router.get('/history', async (req, res, next) => {
  try {
    const history = await prisma.playHistory.findMany({
      take: 10,
      orderBy: { playedAt: 'desc' },
      include: { song: true },
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// POST /api/songs — admin adds a song
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { title, artist, anime, genre, coverUrl, audioUrl, externalId, duration } = req.body;
    if (!title || !artist || !anime || !genre || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const song = await prisma.song.create({
      data: { title, artist, anime, genre, coverUrl, audioUrl, externalId, duration },
    });
    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/songs/:id — admin removes a song
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    await prisma.song.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
