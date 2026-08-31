import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  { name: 'Buzo Adidas Fleece', url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/6637b8e1a6424c18a1219c4851749bf8_9366/Buzo_adidas_Washed_Tela_Fleece_Cuello_Redondo_Negro_KW7343_01_laydown.jpg' },
  { name: 'Buzo con Capucha Essential', url: 'https://www.adidas.com.ar/buzo-con-capucha-essentials-3-tiras-felpa-francesa/JD1877.html' },
  { name: 'Remera Adidas Originals', url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/12e474a9f73d46fba1363724f52c2061_9366/Remera_adidas_Originals_-_Washed_Graphics_Premium_Verde_KU6878_01_laydown_hover.jpg' },
  { name: 'Adidas Ultraboost', url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/7a30fa41a86b4541b5b448d2afd44de2_9366/Zapatillas_de_Running_Boost_Run_W_Negro_KJ0963_01_00_standard.jpg' },
  { name: 'Pantalón Jogger', url: 'https://assets.adidas.com/images/h_2000,f_auto,q_auto,fl_lossy,c_fill,g_auto/b9503b49addc414894c88dfad0e31032_9366/Jogger_Essentials_Holgado_Tela_Fleece_Amarillo_KR3608_01_laydown.jpg' },
  { name: 'Buzo Puma Crew', url: 'https://images.puma.com/image/upload/f_auto,q_auto,w_600,b_rgb:FAFAFA/global/630451/01/fnd/ARG/fmt/png' },
  { name: 'Remera Básica Blanca', url: 'https://images.puma.com/image/upload/f_auto,q_auto,w_600,b_rgb:FAFAFA/global/691883/87/fnd/ARG/fmt/png' },
  { name: 'Puma Suede', url: 'https://images.puma.com/image/upload/f_auto,q_auto,w_600,b_rgb:FAFAFA/global/405345/02/sv02/fnd/ARG/fmt/png' },
  { name: 'Pantalón Deportivo Nike', url: 'https://nikearprod.vtexassets.com/arquivos/ids/1900110-800-800?width=800&height=800&aspect=true' },
  { name: 'Nike Air Max 90', url: 'https://nikearprod.vtexassets.com/arquivos/ids/1888704-800-800?width=800&height=800&aspect=true' },
  { name: 'Remera Nike Pro', url: 'https://www.dexter.com.ar/on/demandware.static/-/Sites-365-dabra-catalog/default/dw22315c38/products/NI_DD1992-011/NI_DD1992-011-1.jpg' }
];

async function main() {
  for (const { name, url } of updates) {
    const products = await prisma.product.findMany({
      where: { name: { contains: name.substring(0, 5), mode: 'insensitive' } }
    });

    const exactMatch = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (exactMatch) {
      await prisma.product.update({
        where: { id: exactMatch.id },
        data: { imageUrl: url }
      });
      console.log(`Updated ${exactMatch.name}`);
    } else if (products.length > 0) {
      await prisma.product.update({
        where: { id: products[0].id },
        data: { imageUrl: url }
      });
      console.log(`Updated ${products[0].name} (partial match)`);
    } else {
      console.log(`Could not definitively find product for: ${name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
