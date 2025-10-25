import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { BackupConfigService } from './backup-config.service';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(private readonly backupConfigService: BackupConfigService) {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<{ success: boolean; filename?: string; error?: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.sql`;
      const filepath = path.join(this.backupDir, filename);

      // Check if Docker container is running
      const { stdout: containerStatus } = await execAsync(
        'docker ps --filter "name=nest-js-db" --format "{{.Names}}"'
      );

      if (!containerStatus.trim()) {
        this.logger.warn('PostgreSQL container not running, starting it...');
        await execAsync('docker-compose up -d db');
        // Wait a bit for the database to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Create backup using pg_dump through Docker
      const backupCommand = `docker exec nest-js-db pg_dump -U ${process.env.DB_USERNAME} -d ${process.env.DB_NAME} > ${filepath}`;

      this.logger.log('Creating database backup...');
      await execAsync(backupCommand);

      this.logger.log(`Backup created successfully: ${filename}`);

      // Clean up old backups after creating new one
      await this.cleanupOldBackups();

      return { success: true, filename };
    } catch (error: any) {
      this.logger.error('Backup failed:', error?.message || 'Unknown error');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  async restoreBackup(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const filepath = path.join(this.backupDir, filename);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Backup file not found: ${filename}`);
      }

      // Check if Docker container is running
      const { stdout: containerStatus } = await execAsync(
        'docker ps --filter "name=nest-js-db" --format "{{.Names}}"'
      );

      if (!containerStatus.trim()) {
        this.logger.warn('PostgreSQL container not running, starting it...');
        await execAsync('docker-compose up -d db');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Restore backup using psql through Docker
      const restoreCommand = `docker exec -i nest-js-db psql -U ${process.env.DB_USERNAME} -d ${process.env.DB_NAME} < ${filepath}`;

      this.logger.log(`Restoring database from backup: ${filename}`);
      await execAsync(restoreCommand);

      this.logger.log('Database restored successfully');
      return { success: true };
    } catch (error: any) {
      this.logger.error('Restore failed:', error?.message || 'Unknown error');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  listBackups(): string[] {
    try {
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter(file => file.endsWith('.sql'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(this.backupDir, a));
          const statB = fs.statSync(path.join(this.backupDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        });
    } catch (error: any) {
      this.logger.error('Failed to list backups:', error?.message || 'Unknown error');
      return [];
    }
  }

  deleteBackup(filename: string): { success: boolean; error?: string } {
    try {
      const filepath = path.join(this.backupDir, filename);

      if (!fs.existsSync(filepath)) {
        throw new Error(`Backup file not found: ${filename}`);
      }

      fs.unlinkSync(filepath);
      this.logger.log(`Backup deleted: ${filename}`);
      return { success: true };
    } catch (error: any) {
      this.logger.error('Delete backup failed:', error?.message || 'Unknown error');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  getBackupInfo(filename: string): { size: number; created: Date; exists: boolean } {
    try {
      const filepath = path.join(this.backupDir, filename);

      if (!fs.existsSync(filepath)) {
        return { size: 0, created: new Date(), exists: false };
      }

      const stats = fs.statSync(filepath);
      return {
        size: stats.size,
        created: stats.birthtime,
        exists: true,
      };
    } catch (error: any) {
      this.logger.error('Failed to get backup info:', error?.message || 'Unknown error');
      return { size: 0, created: new Date(), exists: false };
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const config = this.backupConfigService.getConfig();
      const backups = this.listBackups();

      // Sort backups by creation date (newest first)
      const backupFiles = backups
        .map(filename => {
          const filepath = path.join(this.backupDir, filename);
          const stats = fs.statSync(filepath);
          return {
            filename,
            filepath,
            created: stats.birthtime,
            size: stats.size,
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      // Remove backups that exceed max count
      if (backupFiles.length > config.maxBackups) {
        const filesToDelete = backupFiles.slice(config.maxBackups);
        for (const backup of filesToDelete) {
          try {
            fs.unlinkSync(backup.filepath);
            this.logger.log(`Deleted old backup: ${backup.filename}`);
          } catch (error: any) {
            this.logger.error(`Failed to delete backup ${backup.filename}:`, error?.message);
          }
        }
      }

      // Remove backups older than retention days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

      const oldBackups = backupFiles.filter(backup => backup.created < cutoffDate);
      for (const backup of oldBackups) {
        try {
          fs.unlinkSync(backup.filepath);
          this.logger.log(
            `Deleted backup older than ${config.retentionDays} days: ${backup.filename}`
          );
        } catch (error: any) {
          this.logger.error(`Failed to delete old backup ${backup.filename}:`, error?.message);
        }
      }

      this.logger.log(
        `Backup cleanup completed. Kept ${backupFiles.length - oldBackups.length} backups.`
      );
    } catch (error: any) {
      this.logger.error('Backup cleanup failed:', error?.message || 'Unknown error');
    }
  }

  /**
   * Get backup statistics
   */
  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  } {
    try {
      const backups = this.listBackups();
      let totalSize = 0;
      let oldestDate: Date | null = null;
      let newestDate: Date | null = null;

      for (const filename of backups) {
        const filepath = path.join(this.backupDir, filename);
        const stats = fs.statSync(filepath);
        totalSize += stats.size;

        if (!oldestDate || stats.birthtime < oldestDate) {
          oldestDate = stats.birthtime;
        }
        if (!newestDate || stats.birthtime > newestDate) {
          newestDate = stats.birthtime;
        }
      }

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: oldestDate,
        newestBackup: newestDate,
      };
    } catch (error: any) {
      this.logger.error('Failed to get backup stats:', error?.message || 'Unknown error');
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
      };
    }
  }
}
