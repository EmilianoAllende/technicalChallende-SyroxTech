import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Crear o actualizar usuarios
  const adminPassword = await bcrypt.hash('admin', 10);
  const userPassword = await bcrypt.hash('user', 10);
  const superAdminPassword = await bcrypt.hash('superadmin', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@admin.com' },
    update: { password: superAdminPassword, role: 'SUPERADMIN' },
    create: {
      email: 'superadmin@admin.com',
      password: superAdminPassword,
      role: 'SUPERADMIN',
    },
  });
  console.log(`SuperAdmin created/updated: ${superadmin.email}`);

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

  // Limpiar antes de poblar categorías y productos
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Crear categorías iniciales
  const categoriesData = ['Zapatillas', 'Remeras', 'Pantalones', 'Buzos'];
  const createdCategories: any = {};
  
  for (const [index, name] of categoriesData.entries()) {
    const category = await prisma.category.create({
      data: {
        name,
        position: index + 1,
      },
    });
    createdCategories[name] = category;
    console.log(`Category created: ${category.name}`);
  }

  // 3. Crear productos falsos
  const productsToCreate = [
    { name: 'Nike Air Max 90', description: 'Clásicas zapatillas Nike', price: 120.0, categoryId: createdCategories['Zapatillas'].id, brand: 'Nike' },
    { name: 'Adidas Ultraboost', description: 'Para correr', price: 180.0, categoryId: createdCategories['Zapatillas'].id, brand: 'Adidas' },
    { name: 'Puma Suede', description: 'Estilo urbano', price: 90.0, categoryId: createdCategories['Zapatillas'].id, brand: 'Puma' },
    
    { name: 'Remera Básica Blanca', description: '100% algodón', price: 20.0, categoryId: createdCategories['Remeras'].id, brand: 'ASTRA' },
    { name: 'Remera Nike Pro', description: 'Deportiva transpirable', price: 35.0, categoryId: createdCategories['Remeras'].id, brand: 'Nike' },
    { name: 'Remera Adidas Originals', description: 'Logo gigante', price: 30.0, categoryId: createdCategories['Remeras'].id, brand: 'Adidas' },

    { name: 'Pantalón Jogger', description: 'Cómodo para entrenar', price: 45.0, categoryId: createdCategories['Pantalones'].id, brand: 'ASTRA' },
    { name: 'Jeans Slim Fit', description: 'Estilo casual', price: 60.0, categoryId: createdCategories['Pantalones'].id, brand: 'Levi\'s' },
    { name: 'Pantalón Deportivo Nike', description: 'Ideal invierno', price: 55.0, categoryId: createdCategories['Pantalones'].id, brand: 'Nike' },

    { name: 'Buzo con Capucha Essential', description: 'Abrigo suave', price: 70.0, categoryId: createdCategories['Buzos'].id, brand: 'ASTRA' },
    { name: 'Buzo Puma Crew', description: 'Sin capucha', price: 65.0, categoryId: createdCategories['Buzos'].id, brand: 'Puma' },
    { name: 'Buzo Adidas Fleece', description: 'Grosor máximo', price: 80.0, categoryId: createdCategories['Buzos'].id, brand: 'Adidas' },
  ];

  for (const prod of productsToCreate) {
    await prisma.product.create({ data: prod });
  }
  console.log(`Created ${productsToCreate.length} products.`);

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
