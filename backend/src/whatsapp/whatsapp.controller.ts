import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { WhatsAppService } from './whatsapp.service';

class InitSessionDto {
  sessionName: string;
}

class PairingCodeDto {
  phoneNumber: string;
}

@ApiTags('whatsapp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize a WhatsApp session' })
  async initSession(@Body() dto: InitSessionDto) {
    try {
      return await this.whatsappService.initializeSession(dto.sessionName);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to initialize session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all WhatsApp sessions' })
  async getAllSessions() {
    return this.whatsappService.getAllSessions();
  }

  @Get('status/:sessionName')
  @ApiOperation({ summary: 'Get session status' })
  async getStatus(@Param('sessionName') sessionName: string) {
    return this.whatsappService.getSessionStatus(sessionName);
  }

  @Get('qr/:sessionName')
  @ApiOperation({ summary: 'Get QR code for session' })
  // Returns QR code as a data URL (image/png base64) for display in frontend
  async getQrCode(@Param('sessionName') sessionName: string) {
    const qrCode = await this.whatsappService.getQrCode(sessionName);
    if (!qrCode) {
      throw new HttpException(
        'QR code not available. Session may be connected or not initialized.',
        HttpStatus.NOT_FOUND,
      );
    }
    return { qrCode };
  }

  @Post('pair/:sessionName')
  @ApiOperation({ summary: 'Request pairing code for phone number' })
  async requestPairingCode(@Param('sessionName') sessionName: string, @Body() dto: PairingCodeDto) {
    try {
      const code = await this.whatsappService.requestPairingCode(sessionName, dto.phoneNumber);
      return { pairingCode: code };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to request pairing code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('disconnect/:sessionName')
  @ApiOperation({ summary: 'Disconnect a WhatsApp session' })
  async disconnect(@Param('sessionName') sessionName: string) {
    return this.whatsappService.disconnectSession(sessionName);
  }

  @Delete('session/:sessionName')
  @ApiOperation({ summary: 'Delete a WhatsApp session' })
  async deleteSession(@Param('sessionName') sessionName: string) {
    await this.whatsappService.deleteSession(sessionName);
    return { success: true, message: 'Session deleted successfully' };
  }

  @Post('send/:sessionName')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Param('sessionName') sessionName: string,
    @Body() dto: { phoneNumber: string; message: string },
  ) {
    try {
      await this.whatsappService.sendMessage(sessionName, dto.phoneNumber, dto.message);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
