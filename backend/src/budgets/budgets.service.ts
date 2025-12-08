import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.budget.create({ data: { ...data, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({ where: { userId }, include: { category: true } });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.budget.findFirst({ where: { id, userId }, include: { category: true } });
  }

  async update(id: string, data: any) {
    return this.prisma.budget.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.budget.delete({ where: { id } });
  }
}
