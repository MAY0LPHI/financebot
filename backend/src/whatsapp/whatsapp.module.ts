import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppGateway } from './whatsapp.gateway';
import { CommandParserService } from './command-parser.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminGuard } from '../admin/guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppGateway, CommandParserService, AdminGuard],
  exports: [WhatsAppService, WhatsAppGateway, CommandParserService],
})
export class WhatsAppModule {}
