import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.transaction.create({
      data: { ...data, userId },
      include: { category: true, account: true, card: true },
    });
  }

  async findAll(userId: string, filters?: any) {
    return this.prisma.transaction.findMany({
      where: { userId, ...filters },
      include: { category: true, account: true, card: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: true, account: true, card: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.transaction.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
