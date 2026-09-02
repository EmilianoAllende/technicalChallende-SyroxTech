import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { EmailModule } from './email/email.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [PrismaModule, CategoriesModule, ProductsModule, SalesModule, AuthModule, UsersModule, PaymentsModule, EmailModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
