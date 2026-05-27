// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET last 50 chat messages for initial load
router.get('/', async (req, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, avatarUrl: true } } },
    });
    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
