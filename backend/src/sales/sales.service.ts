import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(data: { clientName: string; clientEmail: string; userId?: number; items: { productId: number; quantity: number; price: number, name?: string }[] }) {
    const orderNumber = randomUUID().split('-')[0].toUpperCase();
    const status = 'En Preparación';
    const paymentStatus = 'Pendiente';
    
    const total = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Prisma Transaction for stock check and update
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify stock for each item
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para el producto ID ${item.productId}`);
        }
      }

      // 2. Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // 3. Create the sale
      return tx.sale.create({
        data: {
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          userId: data.userId || null,
          orderNumber,
          status,
          total,
          paymentStatus,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } } }
    });
  }

  findMyPurchases(userId: number) {
    return this.prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
  }

  async updateStatus(id: number, status?: string, paymentStatus?: string) {
    const data: any = {};
    if (status) data.status = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;
    
    const sale = await this.prisma.sale.update({
      where: { id },
      data
    });

    if (status === 'Enviado') {
      await this.emailService.sendShippingNotification(sale.clientEmail, sale.clientName, sale.orderNumber);
    }

    return sale;
  }

  async getStats() {
    const sales = await this.prisma.sale.findMany({
      select: {
        total: true,
        paymentStatus: true
      }
    });

    const grouped = sales.reduce((acc, sale) => {
      const ps = sale.paymentStatus || 'Desconocido';
      if (!acc[ps]) acc[ps] = 0;
      acc[ps] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    }));
  }

  async getLogisticsStats() {
    const sales = await this.prisma.sale.findMany({
      select: {
        total: true,
        status: true
      }
    });

    const grouped = sales.reduce((acc, sale) => {
      const st = sale.status || 'Desconocido';
      if (!acc[st]) acc[st] = 0;
      // Podemos contar cantidad de órdenes o cantidad de dinero. 
      // Generalmente para logística tiene más sentido contar la CANTIDAD de pedidos, pero si queremos ser consistentes, sumamos el total o sumamos 1.
      // Usaremos cantidad de órdenes (1 por venta) para la logística, o total? 
      // "movimientos de productos físicos" => quantity of items or orders. Let's do orders count for logistics.
      acc[st] += 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    }));
  }
}
