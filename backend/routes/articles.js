// backend/routes/articles.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const prisma = new PrismaClient();

// GET /api/articles — paginated, filterable
router.get('/', async (req, res, next) => {
  try {
    const { category, limit = 12, offset = 0, search } = req.query;
    const where = {
      published: true,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverUrl: true, category: true, tags: true,
          publishedAt: true, views: true,
        },
      }),
      prisma.article.count({ where }),
    ]);
    res.json({ articles, total, hasMore: parseInt(offset) + articles.length < total });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:slug — single article + increment views
router.get('/:slug', async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: {
        comments: {
          include: { user: { select: { username: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!article || !article.published) return res.status(404).json({ error: 'Not found' });
    // Increment views async (non-blocking)
    prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } }).catch(() => {});
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles — create (admin)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, coverUrl, category, tags } = req.body;
    if (!title || !slug || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const article = await prisma.article.create({
      data: {
        title, slug, excerpt, content, coverUrl, category,
        tags: tags || [],
        published: false,
      },
    });
    res.status(201).json(article);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/articles/:id/publish — publish (admin)
router.patch('/:id/publish', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { published: true, publishedAt: new Date() },
    });
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/comments — add comment (auth)
router.post('/:id/comments', verifyToken, async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const comment = await prisma.comment.create({
      data: { userId: req.user.id, articleId: req.params.id, content },
      include: { user: { select: { username: true, avatarUrl: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
