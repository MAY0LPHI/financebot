import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getCashFlow(userId: string, dateFrom: Date, dateTo: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: dateFrom, lte: dateTo },
      },
    });

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      period: `${dateFrom.toISOString().split('T')[0]} to ${dateTo.toISOString().split('T')[0]}`,
      income,
      expenses,
      balance: income - expenses,
    };
  }

  async getExpensesByCategory(userId: string, dateFrom: Date, dateTo: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: dateFrom, lte: dateTo },
      },
      include: { category: true },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const byCategory = transactions.reduce(
      (acc, t) => {
        const categoryName = t.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += Number(t.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(byCategory).map(([categoryName, amount]) => ({
      categoryName,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
  }

  async getBalanceByAccount(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
      },
    });
  }
}
