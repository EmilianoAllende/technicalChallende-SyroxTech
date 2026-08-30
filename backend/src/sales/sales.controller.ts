import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() data: { clientName: string; clientEmail: string; userId?: number; items: { productId: number; quantity: number; price: number }[] }) {
    return this.salesService.create(data);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }
}
