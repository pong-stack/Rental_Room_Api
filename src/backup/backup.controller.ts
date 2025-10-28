import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupConfigService } from './backup-config.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('backup')
export class BackupController {
  constructor(
    private readonly backupService: BackupService,
    private readonly backupConfigService: BackupConfigService
  ) {}

  @Post('create')
  async createBackup(): Promise<ApiResponseDto> {
    const result = await this.backupService.createBackup();

    if (!result.success) {
      throw new HttpException(result.error || 'Backup failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success('Backup created successfully', {
      filename: result.filename,
    });
  }

  @Post('restore')
  async restoreBackup(@Body() body: { filename: string }): Promise<ApiResponseDto> {
    if (!body.filename) {
      throw new HttpException('Filename is required', HttpStatus.BAD_REQUEST);
    }

    const result = await this.backupService.restoreBackup(body.filename);

    if (!result.success) {
      throw new HttpException(result.error || 'Restore failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success('Database restored successfully', {
      filename: body.filename,
    });
  }

  @Get('list')
  listBackups(): ApiResponseDto {
    const backups = this.backupService.listBackups();
    const backupDetails = backups.map(filename => {
      const info = this.backupService.getBackupInfo(filename);
      return {
        filename,
        size: info.size,
        created: info.created,
        exists: info.exists,
      };
    });

    return ApiResponseDto.success('Backups retrieved successfully', {
      backups: backupDetails,
    });
  }

  @Get('info/:filename')
  getBackupInfo(@Param('filename') filename: string): ApiResponseDto {
    const info = this.backupService.getBackupInfo(filename);

    if (!info.exists) {
      throw new HttpException('Backup file not found', HttpStatus.NOT_FOUND);
    }

    return ApiResponseDto.success('Backup info retrieved successfully', {
      filename,
      size: info.size,
      created: info.created,
      sizeFormatted: this.formatBytes(info.size),
    });
  }

  @Delete(':filename')
  deleteBackup(@Param('filename') filename: string): ApiResponseDto {
    const result = this.backupService.deleteBackup(filename);

    if (!result.success) {
      throw new HttpException(result.error || 'Delete failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ApiResponseDto.success('Backup deleted successfully', {
      filename,
    });
  }

  @Get('stats')
  getBackupStats(): ApiResponseDto {
    const stats = this.backupService.getBackupStats();
    return ApiResponseDto.success('Backup statistics retrieved successfully', {
      ...stats,
      totalSizeFormatted: this.formatBytes(stats.totalSize),
    });
  }

  @Get('config')
  getBackupConfig(): ApiResponseDto {
    const config = this.backupConfigService.getConfig();
    return ApiResponseDto.success('Backup configuration retrieved successfully', config);
  }

  @Put('config')
  updateBackupConfig(@Body() config: Partial<any>): ApiResponseDto {
    try {
      this.backupConfigService.updateConfig(config);
      return ApiResponseDto.success('Backup configuration updated successfully', {
        config: this.backupConfigService.getConfig(),
      });
    } catch (error: any) {
      throw new HttpException(
        `Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('cleanup')
  async cleanupOldBackups(): Promise<ApiResponseDto> {
    try {
      await this.backupService.cleanupOldBackups();
      return ApiResponseDto.success('Backup cleanup completed successfully');
    } catch (error: any) {
      throw new HttpException(
        `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
