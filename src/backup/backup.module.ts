import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { ScheduledBackupService } from './scheduled-backup.service';
import { BackupConfigService } from './backup-config.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BackupController],
  providers: [BackupService, ScheduledBackupService, BackupConfigService],
})
export class BackupModule {}
