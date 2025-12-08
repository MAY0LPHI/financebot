import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.account.create({
      data: { ...data, userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.account.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.account.delete({ where: { id } });
  }
}
