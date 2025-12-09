import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async processMessage(userId: string, message: string, sessionId?: string) {
    const newSessionId = sessionId || Math.random().toString(36).substring(7);

    // Simple intent detection
    const lowerMessage = message.toLowerCase();

    // Add expense
    if (lowerMessage.includes('despesa') || lowerMessage.includes('gasto')) {
      return {
        response:
          'Para adicionar uma despesa, preciso saber: valor, descrição e categoria. Por exemplo: "Despesa de R$ 50 em alimentação para almoço"',
        sessionId: newSessionId,
        action: {
          type: 'confirm_transaction',
          data: { type: 'EXPENSE' },
        },
      };
    }

    // Add income
    if (lowerMessage.includes('receita') || lowerMessage.includes('renda')) {
      return {
        response:
          'Para adicionar uma receita, preciso saber: valor, descrição e categoria. Por exemplo: "Receita de R$ 3000 salário"',
        sessionId: newSessionId,
        action: {
          type: 'confirm_transaction',
          data: { type: 'INCOME' },
        },
      };
    }

    // Show balance
    if (lowerMessage.includes('saldo') || lowerMessage.includes('balanço')) {
      const accounts = await this.prisma.account.findMany({
        where: { userId },
      });

      const total = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
      const accountList = accounts
        .map((acc) => `${acc.name}: R$ ${Number(acc.balance).toFixed(2)}`)
        .join(', ');

      return {
        response: `Seu saldo total é R$ ${total.toFixed(2)}. Detalhes: ${accountList}`,
        sessionId: newSessionId,
        action: {
          type: 'show_balance',
          data: { accounts, total },
        },
      };
    }

    // List transactions
    if (lowerMessage.includes('transações') || lowerMessage.includes('gastos recentes')) {
      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        take: 5,
        orderBy: { date: 'desc' },
        include: { category: true },
      });

      const list = transactions
        .map(
          (t) =>
            `${t.type} de R$ ${Number(t.amount).toFixed(2)} - ${t.description} (${t.category?.name || 'Sem categoria'})`,
        )
        .join('; ');

      return {
        response: `Suas últimas transações: ${list || 'Nenhuma transação encontrada.'}`,
        sessionId: newSessionId,
        action: {
          type: 'list_transactions',
          data: transactions,
        },
      };
    }

    // Default response
    return {
      response:
        'Olá! Eu posso ajudar você a gerenciar suas finanças. Você pode: adicionar despesas/receitas, ver saldo, listar transações, criar metas e orçamentos. Como posso ajudar?',
      sessionId: newSessionId,
    };
  }
}
