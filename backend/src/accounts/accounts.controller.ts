import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create account' })
  create(@Request() req, @Body() createAccountDto: any) {
    return this.accountsService.create(req.user.userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  update(@Param('id') id: string, @Request() req, @Body() updateAccountDto: any) {
    return this.accountsService.update(id, req.user.userId, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
}
