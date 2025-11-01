import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleUpgradeController } from './role-upgrade.controller';
import { RoleUpgradeService } from './role-upgrade.service';
import { RoleUpgradeRequest } from '../../entities/role-upgrade-request.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleUpgradeRequest, User])],
  controllers: [RoleUpgradeController],
  providers: [RoleUpgradeService],
  exports: [RoleUpgradeService],
})
export class RoleUpgradeModule {}
