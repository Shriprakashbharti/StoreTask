const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedAdminPassword = await bcrypt.hash('Admin@123!', 12);
  const hashedOwnerPassword = await bcrypt.hash('Owner@123!', 12);
  const hashedUserPassword = await bcrypt.hash('User@123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Store Owner',
      email: 'owner@example.com',
      password: hashedOwnerPassword,
      role: 'OWNER',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@example.com',
      password: hashedUserPassword,
      role: 'USER',
    },
  });

  const stores = [];
  for (let i = 1; i <= 10; i++) {
    const store = await prisma.store.create({
      data: {
        name: `Store ${i}`,
        email: `store${i}@example.com`,
        address: `${i} Main Street, City ${i}`,
        ownerId: i === 1 ? owner.id : null,
      },
    });
    stores.push(store);
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: stores[i - 1].id,
        },
      },
      update: {},
      create: {
        value: Math.floor(Math.random() * 5) + 1,
        userId: user.id,
        storeId: stores[i - 1].id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });