import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(data: { email: string; password?: string }) {
    if (!data.email || !data.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: 'mock-jwt-token-12345', // En un entorno real se firmaría con @nestjs/jwt
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
