import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:id')
  getByProduct(@Param('id') id: string) {
    return this.reviewsService.getByProduct(+id);
  }

  @Get('can-review/:productId')
  canReview(@Query('userId') userId: string, @Param('productId') productId: string) {
    if (!userId) return { canReview: false };
    return this.reviewsService.canReview(+userId, +productId);
  }

  @Post()
  create(@Body() body: { userId: number, productId: number, rating: number, comment?: string }) {
    return this.reviewsService.create(body.userId, body.productId, body.rating, body.comment);
  }
}
