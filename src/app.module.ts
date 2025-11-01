import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '../ormconfig';

// Core modules
import { AuthModule } from './modules/auth/auth.module';
import { HomeModule } from './modules/home/home.module';
import { AdminModule } from './modules/admin/admin.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { VerificationModule } from './modules/verification/verification.module';
import { UserModule } from './modules/user/user.module';
import { BackupModule } from './backup/backup.module';
import { RoleUpgradeModule } from './modules/role-upgrade/role-upgrade.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    // New modular structure
    AuthModule,
    UserModule,
    HomeModule,
    AdminModule,
    InvoiceModule,
    VerificationModule,
    RoleUpgradeModule,
    BackupModule,
    // Legacy module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
