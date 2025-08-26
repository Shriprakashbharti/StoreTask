const express = require('express');
const prisma = require('../prismaClient');
const authenticateToken = require('../middlewares/auth');
const requireRole = require('../middlewares/abac');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('OWNER'));

router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.sub;

    const store = await prisma.store.findFirst({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'No store found for this owner' });
    }

    const ratings = store.ratings.map(r => r.value);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const ratingsCount = ratings.length;

    const raters = store.ratings.map(rating => ({
      name: rating.user.name,
      email: rating.user.email,
      value: rating.value,
      createdAt: rating.createdAt,
    }));

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating,
        ratingsCount,
      },
      raters,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;