import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomRuleDto } from './dto/create-room-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('homes')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async findAllHomes() {
    return this.homeService.findAllHomes();
  }

  @Get('my-homes')
  async findMyHomes(@Request() req) {
    return this.homeService.findHomesByOwner(req.user.id);
  }

  @Get(':id')
  async findHomeById(@Param('id') id: number) {
    return this.homeService.findHomeById(id);
  }

  @Post()
  async createHome(@Body() createHomeDto: CreateHomeDto, @Request() req) {
    return this.homeService.createHome(createHomeDto, req.user.id);
  }

  @Put(':id')
  async updateHome(@Param('id') id: number, @Body() updateHomeDto: UpdateHomeDto, @Request() req) {
    return this.homeService.updateHome(id, updateHomeDto, req.user.id);
  }

  @Delete(':id')
  async deleteHome(@Param('id') id: number, @Request() req) {
    await this.homeService.deleteHome(id, req.user.id);
    return { message: 'Home deleted successfully' };
  }

  // Room endpoints
  @Post(':homeId/rooms')
  async addRoomToHome(
    @Param('homeId') homeId: number,
    @Body() createRoomDto: CreateRoomDto,
    @Request() req
  ) {
    return this.homeService.addRoomToHome(homeId, createRoomDto, req.user.id);
  }

  @Put('rooms/:roomId')
  async updateRoom(
    @Param('roomId') roomId: number,
    @Body() updateRoomDto: Partial<CreateRoomDto>,
    @Request() req
  ) {
    return this.homeService.updateRoom(roomId, updateRoomDto, req.user.id);
  }

  @Delete('rooms/:roomId')
  async deleteRoom(@Param('roomId') roomId: number, @Request() req) {
    await this.homeService.deleteRoom(roomId, req.user.id);
    return { message: 'Room deleted successfully' };
  }

  // Room rules endpoints
  @Post('rooms/:roomId/rules')
  async addRuleToRoom(
    @Param('roomId') roomId: number,
    @Body() createRuleDto: CreateRoomRuleDto,
    @Request() req
  ) {
    return this.homeService.addRuleToRoom(roomId, createRuleDto, req.user.id);
  }

  @Put('rules/:ruleId')
  async updateRoomRule(
    @Param('ruleId') ruleId: number,
    @Body() updateRuleDto: Partial<CreateRoomRuleDto>,
    @Request() req
  ) {
    return this.homeService.updateRoomRule(ruleId, updateRuleDto, req.user.id);
  }

  @Delete('rules/:ruleId')
  async deleteRoomRule(@Param('ruleId') ruleId: number, @Request() req) {
    await this.homeService.deleteRoomRule(ruleId, req.user.id);
    return { message: 'Room rule deleted successfully' };
  }
}
