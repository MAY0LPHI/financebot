import {
  Controller,
  Post,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('import')
@Controller('import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Import transactions from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
  ) {
    const fileContent = file.buffer.toString('utf-8');
    return this.importService.importCSV(req.user.userId, accountId, fileContent);
  }

  @Post('ofx')
  @ApiOperation({ summary: 'Import transactions from OFX' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importOFX(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('accountId') accountId: string,
  ) {
    const fileContent = file.buffer.toString('utf-8');
    return this.importService.importOFX(req.user.userId, accountId, fileContent);
  }
}
