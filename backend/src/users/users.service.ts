import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });
  }

  async create(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role || Role.USER,
      },
      select: { id: true, email: true, role: true }
    });
  }

  async update(id: number, data: any) {
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    // Prevent removing the last SUPERADMIN if updating role
    if (data.role && data.role !== Role.SUPERADMIN) {
      const userToUpdate = await this.prisma.user.findUnique({ where: { id } });
      if (userToUpdate && userToUpdate.role === Role.SUPERADMIN) {
        const superAdminsCount = await this.prisma.user.count({
          where: { role: Role.SUPERADMIN },
        });
        if (superAdminsCount <= 1) {
          throw new BadRequestException('No puedes cambiar el rol del último SUPERADMIN.');
        }
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, role: true }
    });
  }

  async delete(id: number) {
    const userToDelete = await this.prisma.user.findUnique({ where: { id } });
    if (!userToDelete) throw new NotFoundException('Usuario no encontrado');

    if (userToDelete.role === Role.SUPERADMIN) {
      const superAdminsCount = await this.prisma.user.count({
        where: { role: Role.SUPERADMIN },
      });
      if (superAdminsCount <= 1) {
        throw new BadRequestException('No puedes eliminar al último SUPERADMIN. Crea otro primero.');
      }
    }

    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true }
    });
  }
}
