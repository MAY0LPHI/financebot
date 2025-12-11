import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('FinBot WhatsApp API')
    .setDescription('API de Controle Financeiro via WhatsApp Bot')
    .setVersion('1.0')
    .addTag('whatsapp', 'WhatsApp Bot endpoints')
    .addTag('users', 'User management')
    .addTag('accounts', 'Account management')
    .addTag('cards', 'Card management')
    .addTag('categories', 'Category management')
    .addTag('transactions', 'Transaction management')
    .addTag('budgets', 'Budget management')
    .addTag('goals', 'Goal management')
    .addTag('reports', 'Reports and analytics')
    .addTag('import', 'Import CSV/OFX files')
    .addTag('chat', 'Conversational bot')
    .addTag('webhooks', 'Webhook endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT || 3001;
  await app.listen(port);
  console.log(`🤖 FinBot WhatsApp está rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação da API: http://localhost:${port}/api/docs`);
  console.log(`💬 Bot WhatsApp pronto para receber mensagens!`);
}

bootstrap();
