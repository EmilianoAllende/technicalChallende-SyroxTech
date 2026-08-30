import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Crear o actualizar usuarios
  const adminPassword = await bcrypt.hash('admin', 10);
  const userPassword = await bcrypt.hash('user', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: {
      email: 'admin@admin.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin created/updated: ${admin.email}`);

  const user = await prisma.user.upsert({
    where: { email: 'user@user.com' },
    update: { password: userPassword, role: 'USER' },
    create: {
      email: 'user@user.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log(`User created/updated: ${user.email}`);

  // 2. Crear categorías iniciales
  const categories = ['Zapatillas', 'Remeras', 'Pantalones', 'Buzos'];
  
  for (const [index, name] of categories.entries()) {
    const category = await prisma.category.create({
      data: {
        name,
        position: index + 1,
      },
    });
    console.log(`Category created: ${category.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
