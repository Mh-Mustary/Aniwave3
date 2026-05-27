// backend/routes/manga.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const prisma = new PrismaClient();

router.get('/', async (req, res, next) => {
  try {
    const { status, staffPick, featured, limit = 20, offset = 0 } = req.query;
    const where = {
      ...(status && { status }),
      ...(staffPick === 'true' && { staffPick: true }),
      ...(featured === 'true' && { isFeatured: true }),
    };
    const picks = await prisma.mangaPick.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });
    res.json(picks);
  } catch (err) {
    next(err);
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { title, author, coverUrl, genre, status, latestChapter, synopsis, externalUrl, isFeatured, staffPick } = req.body;
    if (!title || !author || !status || !synopsis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pick = await prisma.mangaPick.create({
      data: { title, author, coverUrl, genre: genre || [], status, latestChapter, synopsis, externalUrl, isFeatured: !!isFeatured, staffPick: !!staffPick },
    });
    res.status(201).json(pick);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const pick = await prisma.mangaPick.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(pick);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
