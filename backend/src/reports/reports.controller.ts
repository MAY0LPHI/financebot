import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  getCashFlow(
    @Request() req,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.getCashFlow(req.user.userId, new Date(dateFrom), new Date(dateTo));
  }

  @Get('expenses-by-category')
  @ApiOperation({ summary: 'Get expenses by category report' })
  getExpensesByCategory(
    @Request() req,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportsService.getExpensesByCategory(
      req.user.userId,
      new Date(dateFrom),
      new Date(dateTo),
    );
  }

  @Get('balance-by-account')
  @ApiOperation({ summary: 'Get balance by account' })
  getBalanceByAccount(@Request() req) {
    return this.reportsService.getBalanceByAccount(req.user.userId);
  }
}
