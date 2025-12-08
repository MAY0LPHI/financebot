import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parse } from 'csv-parse/sync';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importCSV(userId: string, accountId: string, fileContent: string) {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const results = {
      imported: 0,
      duplicates: 0,
      errors: 0,
      transactions: [],
    };

    for (const record of records) {
      try {
        const transaction = await this.prisma.transaction.create({
          data: {
            userId,
            accountId,
            type: record.type || 'EXPENSE',
            amount: parseFloat(record.amount),
            currency: record.currency || 'BRL',
            description: record.description,
            date: new Date(record.date),
            isPaid: record.isPaid === 'true' || record.isPaid === '1',
          },
        });
        results.imported++;
        results.transactions.push(transaction);
      } catch (error) {
        results.errors++;
      }
    }

    return results;
  }

  async importOFX(userId: string, accountId: string, fileContent: string) {
    // Simplified OFX parsing - in production, use proper OFX parser
    return {
      imported: 0,
      duplicates: 0,
      errors: 0,
      transactions: [],
      message: 'OFX import is not fully implemented in this demo',
    };
  }
}
