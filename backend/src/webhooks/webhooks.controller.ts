import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('bank')
  @ApiOperation({ summary: 'Receive bank webhook (mock)' })
  async receiveBankWebhook(@Body() data: any) {
    return this.webhooksService.processBankWebhook(data);
  }
}
