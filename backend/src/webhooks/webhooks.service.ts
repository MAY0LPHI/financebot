import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(private prisma: PrismaService) {}

  async processBankWebhook(data: any) {
    // Mock webhook processing
    console.log('Processing bank webhook:', data);
    
    return {
      received: true,
      message: 'Webhook processed successfully (mock)',
      data,
    };
  }
}
