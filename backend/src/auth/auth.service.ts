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
  async register(data: { email: string; password?: string }) {
    if (!data.email || !data.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: 'USER', // Estrictamente USER
      },
    });

    return {
      access_token: 'mock-jwt-token-12345',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async googleLogin(credential: string) {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException('Could not extract email from Google token');
    }

    const email = payload.email;
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Si el usuario no existe, lo creamos con una contraseña aleatoria imposible
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
      user = await this.prisma.user.create({
        data: {
          email,
          password: randomPassword,
          role: 'USER', // Estrictamente USER
        },
      });
    }

    return {
      access_token: 'mock-jwt-token-12345',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
