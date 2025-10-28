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

  async testDatabaseConnection(): Promise<boolean> {
    try {
      console.log('=== Testing Database Connection ===');
      const result = await this.homeRepository.query('SELECT 1 as test');
      console.log('Database connection test result:', result);
      console.log('=== Database Connection OK ===');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  async createHome(createHomeDto: CreateHomeDto, ownerId: number): Promise<Home> {
    try {
      console.log('=== HomeService.createHome Debug ===');
      console.log('Input DTO:', createHomeDto);
      console.log('Owner ID:', ownerId);

      // Extract image_urls and map to individual image columns
      const { image_urls, ...homeData } = createHomeDto;

      // Map image_urls array to individual image columns
      const imageMapping = {
        image1: image_urls?.[0] || homeData.image1,
        image2: image_urls?.[1] || homeData.image2,
        image3: image_urls?.[2] || homeData.image3,
        image4: image_urls?.[3] || homeData.image4,
      };

      console.log('Image mapping:', imageMapping);

      const homeDataToSave = {
        ...homeData,
        ...imageMapping,
        ownerId,
      };

      console.log('Final data to save:', homeDataToSave);

      const home = this.homeRepository.create(homeDataToSave);
      console.log('Created home entity:', home);

      // Use a transaction to ensure data is committed
      const savedHome = await this.homeRepository.manager.transaction(
        async transactionalEntityManager => {
          const result = await transactionalEntityManager.save(Home, home);
          console.log('Transaction saved home:', result);
          return result;
        }
      );

      console.log('Saved home:', savedHome);
      console.log('=== End Debug ===');

      return savedHome;
    } catch (error) {
      console.error('Error in HomeService.createHome:', error);
      throw error;
    }
  }

  async findAllHomes(): Promise<Home[]> {
    try {
      console.log('=== HomeService.findAllHomes Debug ===');
      const homes = await this.homeRepository.find({
        relations: ['owner', 'rooms', 'rooms.rules'],
      });
      console.log('Found homes:', homes);
      console.log('Number of homes:', homes.length);
      console.log('=== End Debug ===');
      return homes;
    } catch (error) {
      console.error('Error in HomeService.findAllHomes:', error);
      throw error;
    }
  }

  async findApprovedHomes(): Promise<Home[]> {
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

    // Extract image_urls and map to individual image columns
    const { image_urls, ...homeData } = updateHomeDto;

    // Map image_urls array to individual image columns if provided
    if (image_urls) {
      home.image1 = image_urls[0] ?? home.image1;
      home.image2 = image_urls[1] ?? home.image2;
      home.image3 = image_urls[2] ?? home.image3;
      home.image4 = image_urls[3] ?? home.image4;
    }

    Object.assign(home, homeData);
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

  async updateHomeImages(
    homeId: number,
    imageData: { image1?: string; image2?: string; image3?: string; image4?: string },
    ownerId: number
  ): Promise<Home> {
    const home = await this.homeRepository.findOne({
      where: { id: homeId },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    if (home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update images for your own homes');
    }

    // Update only the provided image fields
    if (imageData.image1 !== undefined) home.image1 = imageData.image1;
    if (imageData.image2 !== undefined) home.image2 = imageData.image2;
    if (imageData.image3 !== undefined) home.image3 = imageData.image3;
    if (imageData.image4 !== undefined) home.image4 = imageData.image4;

    return this.homeRepository.save(home);
  }

  async updateRoomImages(
    roomId: number,
    imageData: { image1?: string; image2?: string; image3?: string; image4?: string },
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
      throw new ForbiddenException('You can only update images for rooms in your own homes');
    }

    // Update only the provided image fields
    if (imageData.image1 !== undefined) room.image1 = imageData.image1;
    if (imageData.image2 !== undefined) room.image2 = imageData.image2;
    if (imageData.image3 !== undefined) room.image3 = imageData.image3;
    if (imageData.image4 !== undefined) room.image4 = imageData.image4;

    return this.roomRepository.save(room);
  }
}
