import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImages() {
  const updates = [
    { name: 'Buzo con Capucha Essential', url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/27aa0ef1f5b14f6d927b0961f59417ca_9366/Buzo_con_Capucha_Essentials_3_Tiras_Felpa_Francesa_Negro_JD1877_01_laydown.jpg' },
    { name: 'Jeans Slim Fit', url: 'https://bowen.com.ar/media/catalog/product/cache/347cf619bf64f51fa1562e72e60dffd8/d/e/devon_premium_black_pant_grey_tb61222_gy.webp' }
  ];

  for (const { name, url } of updates) {
    const products = await prisma.product.findMany({
      where: { name: { contains: name.substring(0, 5), mode: 'insensitive' } }
    });

    const exactMatch = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      await prisma.product.update({ where: { id: exactMatch.id }, data: { imageUrl: url } });
      console.log(`Updated ${exactMatch.name}`);
    } else if (products.length > 0) {
      await prisma.product.update({ where: { id: products[0].id }, data: { imageUrl: url } });
      console.log(`Updated ${products[0].name} (partial match)`);
    }
  }
}

updateImages().catch(e => console.error(e)).finally(() => prisma.$disconnect());
