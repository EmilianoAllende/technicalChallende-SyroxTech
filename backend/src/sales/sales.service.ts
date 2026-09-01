import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

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
}
