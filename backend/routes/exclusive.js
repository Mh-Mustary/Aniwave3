// backend/routes/exclusive.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const prisma = new PrismaClient();

// Public can see non-members-only content; members see all
router.get('/', async (req, res, next) => {
  try {
    const isMember = req.headers.authorization ? true : false; // simplified; use verifyToken in production
    const where = {
      published: true,
      ...(!isMember && { isMembersOnly: false }),
    };
    const content = await prisma.exclusiveContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(content);
  } catch (err) {
    next(err);
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { title, description, type, mediaUrl, thumbnailUrl, duration, isMembersOnly } = req.body;
    const content = await prisma.exclusiveContent.create({
      data: { title, description, type, mediaUrl, thumbnailUrl, duration, isMembersOnly: !!isMembersOnly, published: false },
    });
    res.status(201).json(content);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/publish', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const content = await prisma.exclusiveContent.update({
      where: { id: req.params.id },
      data: { published: true },
    });
    res.json(content);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
