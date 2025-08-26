const express = require('express');
const { z } = require('zod');
const prisma = require('../prismaClient');
const authenticateToken = require('../middlewares/auth');
const requireRole = require('../middlewares/abac');
const validate = require('../middlewares/validate');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

const createUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'OWNER', 'USER']),
});

const createStoreSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  address: z.string(),
  ownerId: z.string().optional(),
});

router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/users', validate(createUserSchema), async (req, res) => {
  try {
    const { name, email, address, role } = req.body;
    const tempPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stores: {
          include: {
            ratings: {
              select: { value: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let storeRating = null;
    if (user.role === 'OWNER' && user.stores.length > 0) {
      const store = user.stores[0];
      const ratings = store.ratings.map(r => r.value);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const count = ratings.length;
      storeRating = { avg, count };
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, storeRating });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/stores', validate(createStoreSchema), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' },
      });
      if (!owner) {
        return res.status(400).json({ error: 'Owner not found or not an OWNER' });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId,
      },
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stores', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
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
        owner: {
          select: { name: true, email: true },
        },
      },
    });

    const storesWithAggregates = stores.map(store => {
      const ratings = store.ratings.map(r => r.value);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const ratingsCount = ratings.length;
      return {
        ...store,
        avgRating,
        ratingsCount,
      };
    });

    const total = await prisma.store.count({ where });

    res.json({
      stores: storesWithAggregates,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        ratings: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        owner: {
          select: { name: true, email: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const ratings = store.ratings.map(r => r.value);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const ratingsCount = ratings.length;

    res.json({
      ...store,
      avgRating,
      ratingsCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: ownerId, role: 'OWNER' },
      });
      if (!owner) {
        return res.status(400).json({ error: 'Owner not found or not an OWNER' });
      }
    }

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        email,
        address,
        ownerId,
      },
    });

    res.json(store);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.store.delete({
      where: { id },
    });

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;