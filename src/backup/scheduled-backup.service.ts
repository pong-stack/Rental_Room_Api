import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class ScheduledBackupService {
  private readonly logger = new Logger(ScheduledBackupService.name);

  constructor(private readonly backupService: BackupService) {}

  // Run backup every day at midnight (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMidnightBackup() {
    this.logger.log('Starting scheduled backup at midnight...');

    try {
      const result = await this.backupService.createBackup();

      if (result.success) {
        this.logger.log(`Scheduled backup completed successfully: ${result.filename}`);
      } else {
        this.logger.error(`Scheduled backup failed: ${result.error}`);
      }
    } catch (error: any) {
      this.logger.error(
        'Scheduled backup encountered an error:',
        error?.message || 'Unknown error'
      );
    }
  }

  // Optional: Run backup every 6 hours for more frequent backups
  // Uncomment the following method if you want more frequent backups
  // @Cron('0 0 */6 * *')
  // async handleFrequentBackup() {
  //   this.logger.log('Starting frequent backup...');
  //
  //   try {
  //     const result = await this.backupService.createBackup();
  //
  //     if (result.success) {
  //       this.logger.log(`Frequent backup completed successfully: ${result.filename}`);
  //     } else {
  //       this.logger.error(`Frequent backup failed: ${result.error}`);
  //     }
  //   } catch (error: any) {
  //     this.logger.error('Frequent backup encountered an error:', error?.message || 'Unknown error');
  //   }
  // }

  // Optional: Run backup every Sunday at 2 AM for weekly full backup
  // Uncomment the following method if you want weekly backups
  // @Cron('0 2 * * 0')
  // async handleWeeklyBackup() {
  //   this.logger.log('Starting weekly backup...');
  //
  //   try {
  //     const result = await this.backupService.createBackup();
  //
  //     if (result.success) {
  //       this.logger.log(`Weekly backup completed successfully: ${result.filename}`);
  //     } else {
  //       this.logger.error(`Weekly backup failed: ${result.error}`);
  //     }
  //   } catch (error: any) {
  //     this.logger.error('Weekly backup encountered an error:', error?.message || 'Unknown error');
  //   }
  // }
}
