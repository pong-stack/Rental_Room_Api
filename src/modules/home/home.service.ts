import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Home, VerificationStatus } from '../../entities/home.entity';
import { Room } from '../../entities/room.entity';
import { RoomRule } from '../../entities/room-rule.entity';
import { Rule } from '../../entities/rule.entity';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomRuleDto } from './dto/create-room-rule.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { AssignRoomRuleDto } from './dto/assign-room-rule.dto';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Home)
    private homeRepository: Repository<Home>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomRule)
    private roomRuleRepository: Repository<RoomRule>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>
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
        relations: ['owner', 'rooms', 'rooms.rules', 'rooms.rules.rule'],
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
      relations: ['owner', 'rooms', 'rooms.rules', 'rooms.rules.rule'],
      where: { verificationStatus: VerificationStatus.APPROVED },
    });
  }

  async findHomeById(id: number): Promise<Home> {
    const home = await this.homeRepository.findOne({
      where: { id },
      relations: ['owner', 'rooms', 'rooms.rules', 'rooms.rules.rule'],
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return home;
  }

  async findHomesByOwner(ownerId: number): Promise<Home[]> {
    return this.homeRepository.find({
      where: { ownerId },
      relations: ['rooms', 'rooms.rules', 'rooms.rules.rule'],
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

    // Extract ruleIds from DTO before creating room
    const { ruleIds, ...roomData } = createRoomDto;

    const room = this.roomRepository.create({
      ...roomData,
      homeId,
    });

    const savedRoom = await this.roomRepository.save(room);

    // Assign rules if provided
    if (ruleIds && ruleIds.length > 0) {
      await this.assignMultipleRulesToRoom(savedRoom.id, ruleIds, ownerId);
    }

    return savedRoom;
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

  // Rule management
  async getAllRules(): Promise<Rule[]> {
    try {
      console.log('=== HomeService.getAllRules Debug ===');
      const rules = await this.ruleRepository.find({
        where: { isActive: true },
        order: { ruleTitle: 'ASC' },
      });
      console.log('Found rules:', rules);
      console.log('Number of rules:', rules.length);
      console.log('=== End Debug ===');
      return rules;
    } catch (error) {
      console.error('Error in HomeService.getAllRules:', error);
      throw error;
    }
  }

  // Room rules management
  async assignRuleToRoom(
    roomId: number,
    assignRuleDto: AssignRoomRuleDto,
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

    // Check if the rule exists and is active
    const rule = await this.ruleRepository.findOne({
      where: { id: assignRuleDto.ruleId, isActive: true },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found or inactive');
    }

    // Check if this rule is already assigned to this room
    const existingRoomRule = await this.roomRuleRepository.findOne({
      where: { roomId, ruleId: assignRuleDto.ruleId },
    });

    if (existingRoomRule) {
      throw new ForbiddenException('This rule is already assigned to this room');
    }

    const roomRule = this.roomRuleRepository.create({
      roomId,
      ruleId: assignRuleDto.ruleId,
    });

    return this.roomRuleRepository.save(roomRule);
  }

  async assignMultipleRulesToRoom(
    roomId: number,
    ruleIds: number[],
    ownerId: number
  ): Promise<RoomRule[]> {
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

    // Validate that all rules exist and are active
    const rules = await this.ruleRepository.find({
      where: { id: In(ruleIds), isActive: true },
    });

    if (rules.length !== ruleIds.length) {
      const foundRuleIds = rules.map(rule => rule.id);
      const missingRuleIds = ruleIds.filter(id => !foundRuleIds.includes(id));
      throw new NotFoundException(`Rules not found or inactive: ${missingRuleIds.join(', ')}`);
    }

    // Check for existing assignments
    const existingRoomRules = await this.roomRuleRepository.find({
      where: { roomId, ruleId: In(ruleIds) },
    });

    if (existingRoomRules.length > 0) {
      const existingRuleIds = existingRoomRules.map(rr => rr.ruleId);
      throw new ForbiddenException(
        `Rules already assigned to this room: ${existingRuleIds.join(', ')}`
      );
    }

    // Create room rule assignments
    const roomRules = ruleIds.map(ruleId =>
      this.roomRuleRepository.create({
        roomId,
        ruleId,
      })
    );

    return this.roomRuleRepository.save(roomRules);
  }

  async updateRoomRule(
    ruleId: number,
    assignRuleDto: AssignRoomRuleDto,
    ownerId: number
  ): Promise<RoomRule> {
    const roomRule = await this.roomRuleRepository.findOne({
      where: { id: ruleId },
      relations: ['room', 'room.home'],
    });

    if (!roomRule) {
      throw new NotFoundException('Room rule not found');
    }

    if (roomRule.room.home.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update rules for rooms in your own homes');
    }

    // Check if the new rule exists and is active
    const rule = await this.ruleRepository.findOne({
      where: { id: assignRuleDto.ruleId, isActive: true },
    });

    if (!rule) {
      throw new NotFoundException('Rule not found or inactive');
    }

    // Check if this rule is already assigned to this room (excluding current assignment)
    const existingRoomRule = await this.roomRuleRepository.findOne({
      where: {
        roomId: roomRule.roomId,
        ruleId: assignRuleDto.ruleId,
        id: Not(ruleId), // Exclude current assignment
      },
    });

    if (existingRoomRule) {
      throw new ForbiddenException('This rule is already assigned to this room');
    }

    roomRule.ruleId = assignRuleDto.ruleId;
    return this.roomRuleRepository.save(roomRule);
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

  // Rule management methods
  async createRule(createRuleDto: CreateRuleDto): Promise<Rule> {
    const rule = this.ruleRepository.create({
      ruleTitle: createRuleDto.ruleTitle,
      ruleDescription: createRuleDto.ruleDescription,
      isActive: createRuleDto.isActive !== undefined ? createRuleDto.isActive : true,
    });

    return this.ruleRepository.save(rule);
  }
}
