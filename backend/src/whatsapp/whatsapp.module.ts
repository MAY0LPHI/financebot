import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { CommandParserService } from './command-parser.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WhatsAppService, CommandParserService],
  exports: [WhatsAppService, CommandParserService],
})
export class WhatsAppModule {}
