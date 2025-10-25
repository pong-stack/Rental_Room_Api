import { Injectable } from '@nestjs/common';

export interface BackupConfig {
  // Retention settings
  maxBackups: number; // Maximum number of backups to keep
  retentionDays: number; // Number of days to keep backups

  // Scheduling settings
  enableMidnightBackup: boolean;
  enableFrequentBackup: boolean;
  enableWeeklyBackup: boolean;

  // Backup settings
  backupPrefix: string;
  compressionEnabled: boolean;
}

@Injectable()
export class BackupConfigService {
  private readonly config: BackupConfig = {
    // Keep maximum 30 backups or backups from last 30 days
    maxBackups: 30,
    retentionDays: 30,

    // Scheduling options
    enableMidnightBackup: true,
    enableFrequentBackup: false,
    enableWeeklyBackup: false,

    // Backup settings
    backupPrefix: 'auto-backup',
    compressionEnabled: false,
  };

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<BackupConfig>): void {
    Object.assign(this.config, newConfig);
  }

  // Get environment-based configuration
  getEnvironmentConfig(): BackupConfig {
    return {
      maxBackups: parseInt(process.env.BACKUP_MAX_COUNT || '30'),
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      enableMidnightBackup: process.env.BACKUP_MIDNIGHT_ENABLED !== 'false',
      enableFrequentBackup: process.env.BACKUP_FREQUENT_ENABLED === 'true',
      enableWeeklyBackup: process.env.BACKUP_WEEKLY_ENABLED === 'true',
      backupPrefix: process.env.BACKUP_PREFIX || 'auto-backup',
      compressionEnabled: process.env.BACKUP_COMPRESSION_ENABLED === 'true',
    };
  }
}
