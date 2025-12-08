import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ParsedCommand {
  intent: 'add_income' | 'add_expense' | 'check_balance' | 'list_transactions' | 'check_goals' | 'help' | 'unknown';
  amount?: number;
  description?: string;
  categoryName?: string;
}

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable()
export class CommandParserService {
  constructor(private prisma: PrismaService) {}

  parseCommand(text: string): ParsedCommand {
    const lowerText = text.toLowerCase().trim();

    if (this.matchesPattern(lowerText, ['ajuda', 'help', 'comandos', 'menu', '/start'])) {
      return { intent: 'help' };
    }

    if (this.matchesPattern(lowerText, ['recebi', 'ganhei', 'entrada', 'receita', 'salário', 'salario'])) {
      const { amount, description, categoryName } = this.extractTransactionDetails(text);
      return { intent: 'add_income', amount, description, categoryName };
    }

    if (this.matchesPattern(lowerText, ['gastei', 'paguei', 'comprei', 'despesa', 'gasto', 'saída', 'saida'])) {
      const { amount, description, categoryName } = this.extractTransactionDetails(text);
      return { intent: 'add_expense', amount, description, categoryName };
    }

    if (this.matchesPattern(lowerText, ['saldo', 'quanto tenho', 'balanço', 'balanco', 'contas'])) {
      return { intent: 'check_balance' };
    }

    if (this.matchesPattern(lowerText, ['transações', 'transacoes', 'extrato', 'histórico', 'historico', 'últimas', 'ultimas', 'movimentações', 'movimentacoes'])) {
      return { intent: 'list_transactions' };
    }

    if (this.matchesPattern(lowerText, ['meta', 'metas', 'objetivo', 'objetivos', 'goal', 'goals'])) {
      return { intent: 'check_goals' };
    }

    return { intent: 'unknown' };
  }

  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  private parsePortugueseNumber(value: string): number | undefined {
    if (!value) return undefined;
    
    let normalized = value.trim();
    
    const hasComma = normalized.includes(',');
    const hasDot = normalized.includes('.');
    
    if (hasComma && hasDot) {
      const lastComma = normalized.lastIndexOf(',');
      const lastDot = normalized.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        normalized = normalized.replace(/\./g, '').replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (hasComma) {
      const parts = normalized.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        normalized = normalized.replace(',', '.');
      } else {
        normalized = normalized.replace(/,/g, '');
      }
    } else if (hasDot) {
      const parts = normalized.split('.');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 3 || parts.length > 2) {
        normalized = normalized.replace(/\./g, '');
      }
    }
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? undefined : parsed;
  }

  private extractTransactionDetails(text: string): { amount?: number; description?: string; categoryName?: string } {
    let amount: number | undefined;
    const amountPatterns = [
      /R?\$?\s*([\d.,]+)/i,
      /([\d.,]+)\s*(?:reais|real|r\$)/i,
      /([\d.,]+)/
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        amount = this.parsePortugueseNumber(match[1]);
        if (amount && amount > 0) break;
      }
    }

    const categoryKeywords: Record<string, string[]> = {
      'Alimentação': ['alimentação', 'alimentacao', 'comida', 'almoço', 'almoco', 'jantar', 'café', 'cafe', 'lanche', 'restaurante', 'mercado', 'supermercado'],
      'Transporte': ['transporte', 'uber', 'táxi', 'taxi', 'ônibus', 'onibus', 'metrô', 'metro', 'gasolina', 'combustível', 'combustivel'],
      'Moradia': ['aluguel', 'condomínio', 'condominio', 'iptu', 'luz', 'água', 'agua', 'gás', 'gas', 'internet'],
      'Saúde': ['saúde', 'saude', 'médico', 'medico', 'farmácia', 'farmacia', 'remédio', 'remedio', 'consulta', 'hospital'],
      'Lazer': ['lazer', 'cinema', 'netflix', 'spotify', 'diversão', 'diversao', 'festa', 'bar', 'viagem'],
      'Educação': ['educação', 'educacao', 'curso', 'escola', 'faculdade', 'livro', 'estudo'],
      'Salário': ['salário', 'salario', 'pagamento', 'trabalho', 'freela', 'freelancer'],
      'Outros': []
    };

    const lowerText = text.toLowerCase();
    let categoryName: string | undefined;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        categoryName = category;
        break;
      }
    }

    let description = text
      .replace(/R?\$?\s*\d+(?:[.,]\d{1,2})?/gi, '')
      .replace(/(?:recebi|ganhei|gastei|paguei|comprei|entrada|saída|saida|despesa|receita|com|de|em|para|no|na)/gi, '')
      .trim();

    if (description.length < 3) {
      description = categoryName || 'Transação via WhatsApp';
    }

    return { amount, description, categoryName };
  }

  async executeCommand(userId: string, command: ParsedCommand): Promise<CommandResult> {
    switch (command.intent) {
      case 'help':
        return this.getHelpMessage();

      case 'add_income':
        return this.addTransaction(userId, 'INCOME', command);

      case 'add_expense':
        return this.addTransaction(userId, 'EXPENSE', command);

      case 'check_balance':
        return this.getBalance(userId);

      case 'list_transactions':
        return this.getTransactions(userId);

      case 'check_goals':
        return this.getGoals(userId);

      case 'unknown':
      default:
        return {
          success: false,
          message: 'Não entendi seu comando. Digite *ajuda* para ver os comandos disponíveis.'
        };
    }
  }

  private getHelpMessage(): CommandResult {
    const helpText = `🤖 *FinBot - Comandos Disponíveis*

💰 *Adicionar Receita:*
• "Recebi 500 de salário"
• "Ganhei 200 de freelance"

💸 *Adicionar Despesa:*
• "Gastei 50 com alimentação"
• "Paguei 100 de luz"

📊 *Consultar Saldo:*
• "Qual meu saldo"
• "Quanto tenho"

📋 *Ver Transações:*
• "Minhas transações"
• "Mostrar extrato"

🎯 *Ver Metas:*
• "Minhas metas"
• "Como estão meus objetivos"

Dica: Inclua categoria e descrição para organizar melhor!`;

    return { success: true, message: helpText };
  }

  private async addTransaction(
    userId: string,
    type: 'INCOME' | 'EXPENSE',
    command: ParsedCommand
  ): Promise<CommandResult> {
    if (!command.amount || command.amount <= 0) {
      return {
        success: false,
        message: 'Não consegui identificar o valor. Por favor, inclua o valor na mensagem. Exemplo: "Gastei 50 com alimentação"'
      };
    }

    const account = await this.prisma.account.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    if (!account) {
      return {
        success: false,
        message: 'Você não tem nenhuma conta cadastrada. Acesse o sistema web para criar uma conta primeiro.'
      };
    }

    let categoryId: string | undefined;
    if (command.categoryName) {
      const category = await this.prisma.category.findFirst({
        where: {
          userId,
          name: { contains: command.categoryName, mode: 'insensitive' }
        }
      });
      categoryId = category?.id;
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: account.id,
        categoryId,
        type,
        amount: command.amount,
        description: command.description || `${type === 'INCOME' ? 'Receita' : 'Despesa'} via WhatsApp`,
        date: new Date(),
      },
      include: { category: true, account: true }
    });

    const balanceChange = type === 'INCOME' ? command.amount : -command.amount;
    await this.prisma.account.update({
      where: { id: account.id },
      data: { balance: { increment: balanceChange } }
    });

    const emoji = type === 'INCOME' ? '💰' : '💸';
    const typeText = type === 'INCOME' ? 'Receita' : 'Despesa';
    const categoryText = transaction.category ? ` (${transaction.category.name})` : '';

    return {
      success: true,
      message: `${emoji} *${typeText} registrada!*\n\nValor: R$ ${command.amount.toFixed(2)}\nDescrição: ${transaction.description}${categoryText}\nConta: ${account.name}`,
      data: transaction
    };
  }

  private async getBalance(userId: string): Promise<CommandResult> {
    const accounts = await this.prisma.account.findMany({
      where: { userId }
    });

    if (accounts.length === 0) {
      return {
        success: false,
        message: 'Você não tem nenhuma conta cadastrada.'
      };
    }

    const total = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const accountsList = accounts
      .map(acc => `• ${acc.name}: R$ ${Number(acc.balance).toFixed(2)}`)
      .join('\n');

    return {
      success: true,
      message: `💰 *Seu Saldo*\n\n${accountsList}\n\n*Total: R$ ${total.toFixed(2)}*`,
      data: { accounts, total }
    };
  }

  private async getTransactions(userId: string): Promise<CommandResult> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      take: 10,
      orderBy: { date: 'desc' },
      include: { category: true }
    });

    if (transactions.length === 0) {
      return {
        success: true,
        message: '📋 Você não tem nenhuma transação registrada.'
      };
    }

    const list = transactions.map(t => {
      const emoji = t.type === 'INCOME' ? '💰' : '💸';
      const sign = t.type === 'INCOME' ? '+' : '-';
      const category = t.category?.name || 'Sem categoria';
      const date = new Date(t.date).toLocaleDateString('pt-BR');
      return `${emoji} ${sign}R$ ${Number(t.amount).toFixed(2)} - ${t.description} (${category}) - ${date}`;
    }).join('\n');

    return {
      success: true,
      message: `📋 *Últimas Transações*\n\n${list}`,
      data: transactions
    };
  }

  private async getGoals(userId: string): Promise<CommandResult> {
    const goals = await this.prisma.goal.findMany({
      where: { userId }
    });

    if (goals.length === 0) {
      return {
        success: true,
        message: '🎯 Você não tem nenhuma meta cadastrada. Acesse o sistema web para criar suas metas!'
      };
    }

    const list = goals.map(g => {
      const current = Number(g.currentAmount);
      const target = Number(g.targetAmount);
      const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      const progressBar = this.createProgressBar(percentage);
      const targetDate = g.targetDate ? ` (até ${new Date(g.targetDate).toLocaleDateString('pt-BR')})` : '';
      return `🎯 *${g.name}*${targetDate}\n${progressBar} ${percentage.toFixed(0)}%\nR$ ${current.toFixed(2)} / R$ ${target.toFixed(2)}`;
    }).join('\n\n');

    return {
      success: true,
      message: `🎯 *Suas Metas*\n\n${list}`,
      data: goals
    };
  }

  private createProgressBar(percentage: number): string {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '▓'.repeat(filled) + '░'.repeat(empty);
  }
}
