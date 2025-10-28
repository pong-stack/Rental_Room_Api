import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Home } from '../../entities/home.entity';
import { Room } from '../../entities/room.entity';
import { RoomRule } from '../../entities/room-rule.entity';
import { User } from '../../entities/user.entity';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Home, Room, RoomRule, User])],
  controllers: [HomeController],
  providers: [HomeService, FileUploadService],
  exports: [HomeService],
})
export class HomeModule {}
