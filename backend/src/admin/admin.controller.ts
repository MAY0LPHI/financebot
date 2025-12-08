import {
  Controller,
  Get,
  Patch,
  Put,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { UpdateUserDto, UpdateSettingDto, CreateSettingDto, AuditLogFilterDto } from './dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get all system settings' })
  async getAllSettings() {
    return this.adminService.getAllSettings();
  }

  @Get('settings/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  async getSettingByKey(@Param('key') key: string) {
    return this.adminService.getSettingByKey(key);
  }

  @Put('settings/:key')
  @ApiOperation({ summary: 'Update or create setting' })
  async upsertSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.adminService.upsertSetting(key, dto);
  }

  @Post('settings')
  @ApiOperation({ summary: 'Create new setting' })
  async createSetting(@Body() dto: CreateSettingDto) {
    return this.adminService.createSetting(dto);
  }

  @Delete('settings/:key')
  @ApiOperation({ summary: 'Delete setting' })
  async deleteSetting(@Param('key') key: string) {
    return this.adminService.deleteSetting(key);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs with filters' })
  async getAuditLogs(@Query() filter: AuditLogFilterDto) {
    return this.adminService.getAuditLogs(filter);
  }

  @Get('whatsapp/sessions')
  @ApiOperation({ summary: 'Get WhatsApp sessions' })
  async getWhatsAppSessions() {
    return this.adminService.getWhatsAppSessions();
  }

  @Get('whatsapp/contacts')
  @ApiOperation({ summary: 'Get WhatsApp contacts' })
  async getWhatsAppContacts() {
    return this.adminService.getWhatsAppContacts();
  }
}
