import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@finbot.test' },
    update: {},
    create: {
      email: 'demo@finbot.test',
      password: hashedPassword,
      name: 'Demo User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create accounts
  const checkingAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Conta Corrente',
      type: 'CHECKING',
      balance: 5000.0,
      currency: 'BRL',
      color: '#4CAF50',
      icon: '💳',
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Poupança',
      type: 'SAVINGS',
      balance: 10000.0,
      currency: 'BRL',
      color: '#2196F3',
      icon: '💰',
    },
  });

  console.log('✅ Accounts created');

  // Create card
  const creditCard = await prisma.card.create({
    data: {
      userId: demoUser.id,
      accountId: checkingAccount.id,
      name: 'Cartão de Crédito',
      type: 'CREDIT',
      lastFourDigits: '1234',
      limit: 3000.0,
      closingDay: 5,
      dueDay: 15,
    },
  });

  console.log('✅ Card created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        userId: demoUser.id,
        name: 'Moradia',
        type: 'FIXED',
        color: '#FF5722',
        icon: '🏠',
      },
    }),
    prisma.category.create({
      data: {
        userId: demoUser.id,
        name: 'Alimentação',
        type: 'VARIABLE',
        color: '#FF9800',
        icon: '🍔',
      },
    }),
    prisma.category.create({
      data: {
        userId: demoUser.id,
        name: 'Transporte',
        type: 'VARIABLE',
        color: '#9C27B0',
        icon: '🚗',
      },
    }),
    prisma.category.create({
      data: {
        userId: demoUser.id,
        name: 'Lazer',
        type: 'VARIABLE',
        color: '#E91E63',
        icon: '🎮',
      },
    }),
    prisma.category.create({
      data: {
        userId: demoUser.id,
        name: 'Salário',
        type: 'FIXED',
        color: '#4CAF50',
        icon: '💵',
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create sample transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'INCOME',
        amount: 5000.0,
        currency: 'BRL',
        description: 'Salário mensal',
        date: new Date('2024-01-01'),
        categoryId: categories[4].id,
        accountId: checkingAccount.id,
        isPaid: true,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 1200.0,
        currency: 'BRL',
        description: 'Aluguel',
        date: new Date('2024-01-05'),
        categoryId: categories[0].id,
        accountId: checkingAccount.id,
        isPaid: true,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 450.0,
        currency: 'BRL',
        description: 'Supermercado',
        date: new Date('2024-01-10'),
        categoryId: categories[1].id,
        cardId: creditCard.id,
        isPaid: true,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 150.0,
        currency: 'BRL',
        description: 'Combustível',
        date: new Date('2024-01-15'),
        categoryId: categories[2].id,
        accountId: checkingAccount.id,
        isPaid: true,
      },
    }),
    prisma.transaction.create({
      data: {
        userId: demoUser.id,
        type: 'EXPENSE',
        amount: 200.0,
        currency: 'BRL',
        description: 'Cinema e jantar',
        date: new Date('2024-01-20'),
        categoryId: categories[3].id,
        cardId: creditCard.id,
        isPaid: true,
      },
    }),
  ]);

  console.log('✅ Transactions created');

  // Create budget
  await prisma.budget.create({
    data: {
      userId: demoUser.id,
      categoryId: categories[1].id,
      name: 'Orçamento de Alimentação',
      amount: 800.0,
      period: 'MONTHLY',
      startDate: new Date('2024-01-01'),
      alertPercentage: 80,
    },
  });

  console.log('✅ Budget created');

  // Create goal
  await prisma.goal.create({
    data: {
      userId: demoUser.id,
      name: 'Viagem de férias',
      targetAmount: 5000.0,
      currentAmount: 1500.0,
      currency: 'BRL',
      targetDate: new Date('2024-12-31'),
    },
  });

  console.log('✅ Goal created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
