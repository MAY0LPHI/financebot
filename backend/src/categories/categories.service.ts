import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.category.create({ data: { ...data, userId } });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.category.findFirst({ where: { id, userId } });
  }

  async update(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
