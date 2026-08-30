import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  create() {
    // Generar una venta aleatoria para simular el botón "Generar Venta"
    const orderNumber = randomUUID().split('-')[0].toUpperCase();
    const statuses = ['En Preparación', 'Enviado', 'Cancelado'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const total = Math.floor(Math.random() * (5000 - 100 + 1) + 100);
    const paymentStatuses = ['Pagado', 'Fallido'];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    return this.prisma.sale.create({
      data: {
        clientName: 'Cliente Simulado',
        clientEmail: 'cliente@simulado.com',
        orderNumber,
        status,
        total,
        paymentStatus,
      },
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
    });
  }
}
