import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.card.create({ data: { ...data, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.card.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.card.findFirst({ where: { id, userId } });
  }

  async update(id: string, data: any) {
    return this.prisma.card.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.card.delete({ where: { id } });
  }
}
