import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Keep the HTTP server running for health checks
  const port = process.env.APP_PORT || 3001;
  await app.listen(port);

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║   🤖 FinBot WhatsApp - Bot de Controle Financeiro          ║');
  console.log('║                                                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║   🌐 Servidor rodando na porta: ${port}                        ║`);
  console.log('║   📱 Sessão WhatsApp será iniciada automaticamente         ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
}

bootstrap();
