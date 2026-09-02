import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, productId: number, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5.');
    }

    // 1. Verificar si el usuario compró el producto
    // Buscamos una venta asociada a este usuario que contenga este producto
    // y cuyo estado físico sea "Completado" o estado de pago sea "Pagado" (para permitir reseñar sin esperar envío si queremos, pero lo ideal es requerir la compra)
    const sale = await this.prisma.sale.findFirst({
      where: {
        userId,
        items: {
          some: {
            productId
          }
        },
        // Opcionalmente podemos requerir que esté Completado:
        // status: 'Completado' 
      }
    });

    if (!sale) {
      throw new BadRequestException('Solo los clientes que compraron este producto pueden dejar una reseña.');
    }

    // 2. Verificar si ya dejó una reseña (evitar spam)
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      throw new BadRequestException('Ya has dejado una reseña para este producto.');
    }

    // 3. Crear reseña
    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });
  }

  async getByProduct(productId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length
      : 0;

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      reviews
    };
  }

  async canReview(userId: number, productId: number) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        userId,
        items: {
          some: { productId }
        }
      }
    });

    if (!sale) return { canReview: false };

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId }
    });

    return { canReview: !existingReview };
  }
}
