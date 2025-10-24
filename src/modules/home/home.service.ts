import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Home, VerificationStatus } from '../../entities/home.entity';
import { Room } from '../../entities/room.entity';
import { RoomRule } from '../../entities/room-rule.entity';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomRuleDto } from './dto/create-room-rule.dto';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Home)
    private homeRepository: Repository<Home>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomRule)
    private roomRuleRepository: Repository<RoomRule>
  ) {}

  async createHome(createHomeDto: CreateHomeDto, ownerId: number): Promise<Home> {
    const home = this.homeRepository.create({
      ...createHomeDto,
      ownerId,
    });
    return this.homeRepository.save(home);
  }

  async findAllHomes(): Promise<Home[]> {
    return this.homeRepository.find({
      relations: ['owner', 'rooms', 'rooms.rules'],
      where: { verificationStatus: VerificationStatus.APPROVED },
    });
  }

  async findHomeById(id: number): Promise<Home> {
    const home = await this.homeRepository.findOne({
      where: { id },
      relations: ['owner', 'rooms', 'rooms.rules'],
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return home;
  }

  async findHomesByOwner(ownerId: number): Promise<Home[]> {
    return this.homeRepository.find({
      where: { ownerId },
      relations: ['rooms', 'rooms.rules'],
    });
  }

  async updateHome(id: number, updateHomeDto: UpdateHomeDto, ownerId: number): Promise<Home> {
    const home = await this.findHomeById(id);

    if (home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own homes');
    }

    Object.assign(home, updateHomeDto);
    return this.homeRepository.save(home);
  }

  async deleteHome(id: number, ownerId: number): Promise<void> {
    const home = await this.findHomeById(id);

    if (home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own homes');
    }

    await this.homeRepository.remove(home);
  }

  // Room management
  async addRoomToHome(
    homeId: number,
    createRoomDto: CreateRoomDto,
    ownerId: number
  ): Promise<Room> {
    const home = await this.findHomeById(homeId);

    if (home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only add rooms to your own homes');
    }

    const room = this.roomRepository.create({
      ...createRoomDto,
      homeId,
    });

    return this.roomRepository.save(room);
  }

  async updateRoom(
    roomId: number,
    updateRoomDto: Partial<CreateRoomDto>,
    ownerId: number
  ): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['home'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update rooms in your own homes');
    }

    Object.assign(room, updateRoomDto);
    return this.roomRepository.save(room);
  }

  async deleteRoom(roomId: number, ownerId: number): Promise<void> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['home'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete rooms from your own homes');
    }

    await this.roomRepository.remove(room);
  }

  // Room rules management
  async addRuleToRoom(
    roomId: number,
    createRuleDto: CreateRoomRuleDto,
    ownerId: number
  ): Promise<RoomRule> {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['home'],
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only add rules to rooms in your own homes');
    }

    const rule = this.roomRuleRepository.create({
      ...createRuleDto,
      roomId,
    });

    return this.roomRuleRepository.save(rule);
  }

  async updateRoomRule(
    ruleId: number,
    updateRuleDto: Partial<CreateRoomRuleDto>,
    ownerId: number
  ): Promise<RoomRule> {
    const rule = await this.roomRuleRepository.findOne({
      where: { id: ruleId },
      relations: ['room', 'room.home'],
    });

    if (!rule) {
      throw new NotFoundException('Room rule not found');
    }

    if (rule.room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update rules for rooms in your own homes');
    }

    Object.assign(rule, updateRuleDto);
    return this.roomRuleRepository.save(rule);
  }

  async deleteRoomRule(ruleId: number, ownerId: number): Promise<void> {
    const rule = await this.roomRuleRepository.findOne({
      where: { id: ruleId },
      relations: ['room', 'room.home'],
    });

    if (!rule) {
      throw new NotFoundException('Room rule not found');
    }

    if (rule.room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete rules for rooms in your own homes');
    }

    await this.roomRuleRepository.remove(rule);
  }
}
