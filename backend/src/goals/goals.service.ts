import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.goal.create({ data: { ...data, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.goal.findFirst({ where: { id, userId } });
  }

  async update(id: string, data: any) {
    return this.prisma.goal.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.goal.delete({ where: { id } });
  }
}
