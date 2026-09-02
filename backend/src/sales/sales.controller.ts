import { Controller, Get, Post, Param, Body, Query, Patch } from '@nestjs/common';
import { SalesService } from './sales.service';

import { PaymentsService } from '../payments/payments.service';

@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  async create(@Body() data: { clientName: string; clientEmail: string; userId?: number; paymentMethod?: 'stripe' | 'mercadopago'; items: { productId: number; quantity: number; price: number, name?: string }[] }) {
    // 1. Crear la venta en la DB (Pendiente)
    const sale = await this.salesService.create(data);
    
    // 2. Generar sesión de pago
    let session;
    if (data.paymentMethod === 'mercadopago') {
      session = await this.paymentsService.createMercadoPagoPreference(
        sale.id,
        data.items,
        data.clientEmail
      );
    } else {
      session = await this.paymentsService.createCheckoutSession(
        sale.id,
        data.items,
        data.clientEmail
      );
    }

    return { sale, url: session.url };
  }

  @Get('my-purchases')
  findMyPurchases(@Query('userId') userId: string) {
    if (!userId) return [];
    return this.salesService.findMyPurchases(+userId);
  }

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Get('stats/money')
  getStats() {
    return this.salesService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; paymentStatus?: string }
  ) {
    return this.salesService.updateStatus(+id, body.status, body.paymentStatus);
  }
}
