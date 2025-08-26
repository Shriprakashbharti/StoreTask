const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const authenticateToken = require('../middlewares/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(authenticateToken);

const ratingSchema = z.object({
  value: z.number().min(1).max(5),
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, q, sort = 'name' } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.sub;

    const where = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        ratings: {
          select: { value: true },
        },
      },
      orderBy: { [sort]: 'asc' },
    });

    const storesWithAggregates = await Promise.all(
      stores.map(async (store) => {
        const ratings = store.ratings.map(r => r.value);
        const overallRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        const ratingsCount = ratings.length;

        const userRating = await prisma.rating.findUnique({
          where: {
            userId_storeId: {
              userId,
              storeId: store.id,
            },
          },
        });

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          overallRating,
          ratingsCount,
          userRating: userRating ? userRating.value : null,
        };
      })
    );

    const total = await prisma.store.count({ where });

    res.json({
      stores: storesWithAggregates,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          select: { value: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const ratings = store.ratings.map(r => r.value);
    const overallRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const ratingsCount = ratings.length;

    const userRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: store.id,
        },
      },
    });

    res.json({
      ...store,
      overallRating,
      ratingsCount,
      userRating: userRating ? userRating.value : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/ratings', validate(ratingSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user.sub;

    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId: id,
        },
      },
      update: { value },
      create: {
        value,
        userId,
        storeId: id,
      },
    });

    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;