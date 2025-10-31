import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto } from './dto/create-home.dto';
import { UpdateHomeDto } from './dto/update-home.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import { AssignRoomRuleDto } from './dto/assign-room-rule.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../../common/services/file-upload.service';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Controller('homes')
// @UseGuards(JwtAuthGuard) // Temporarily disabled for testing
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    private readonly fileUploadService: FileUploadService
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory(): void {
    const uploadsDir = join(process.cwd(), 'uploads');
    const imagesDir = join(uploadsDir, 'images');

    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    if (!existsSync(imagesDir)) {
      mkdirSync(imagesDir, { recursive: true });
    }
  }

  @Get()
  async findAllHomes(): Promise<ApiResponseDto> {
    const homes = await this.homeService.findAllHomes();
    return ApiResponseDto.success('Homes retrieved successfully', homes);
  }

  @Get('test-db')
  async testDatabase(): Promise<ApiResponseDto> {
    const isConnected = await this.homeService.testDatabaseConnection();
    return ApiResponseDto.success('Database connection test', { connected: isConnected });
  }

  @Get('approved')
  async findApprovedHomes(): Promise<ApiResponseDto> {
    const homes = await this.homeService.findApprovedHomes();
    return ApiResponseDto.success('Approved homes retrieved successfully', homes);
  }

  @Get('my-homes')
  async findMyHomes(@Request() req): Promise<ApiResponseDto> {
    const homes = await this.homeService.findHomesByOwner(req.user.id);
    return ApiResponseDto.success('User homes retrieved successfully', homes);
  }

  // Rules endpoints
  @Get('rules')
  async getAllRules(): Promise<ApiResponseDto> {
    const rules = await this.homeService.getAllRules();
    return ApiResponseDto.success('Rules retrieved successfully', rules);
  }

  @Get(':id')
  async findHomeById(@Param('id') id: number): Promise<ApiResponseDto> {
    const home = await this.homeService.findHomeById(id);
    return ApiResponseDto.success('Home retrieved successfully', home);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'images'),
        filename: (req, file, callback) => {
          if (file && file.originalname) {
            const fileUploadService = new FileUploadService();
            const uniqueName = fileUploadService.generateUniqueFileName(file.originalname);
            callback(null, uniqueName);
          } else {
            callback(new Error('Invalid file'), '');
          }
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async createHome(
    @Body() createHomeDto: CreateHomeDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ): Promise<ApiResponseDto> {
    try {
      console.log('=== File Upload Debug ===');
      console.log('Creating home with data:', createHomeDto);
      console.log('Uploaded files:', files);
      console.log('Files count:', files ? files.length : 0);

      if (files && files.length > 0) {
        files.forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            originalname: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
          });
        });
      }

      // Process uploaded files and add URLs to DTO
      if (files && files.length > 0) {
        // Validate files
        for (const file of files) {
          if (!this.fileUploadService.validateImageFile(file)) {
            throw new BadRequestException(`Invalid file: ${file.originalname}`);
          }
        }

        // Generate actual image URLs from uploaded files
        const imageUrls = files.map(
          file => `http://localhost:6001/uploads/images/${file.filename}`
        );
        createHomeDto.images = imageUrls;
        console.log('Image URLs:', imageUrls);
      }

      // Use the actual service to create the home in the database
      const ownerId = req.user?.id || 1; // Default to 1 for testing
      const home = await this.homeService.createHome(createHomeDto, ownerId);

      console.log('Created home:', home);
      console.log('=== End File Upload Debug ===');

      return ApiResponseDto.created('Home created successfully', home);
    } catch (error) {
      console.error('Error creating home:', error);
      throw error;
    }
  }

  @Put(':id')
  async updateHome(
    @Param('id') id: number,
    @Body() updateHomeDto: UpdateHomeDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const home = await this.homeService.updateHome(id, updateHomeDto, userId);
    return ApiResponseDto.success('Home updated successfully', home);
  }

  @Delete(':id')
  async deleteHome(@Param('id') id: number, @Request() req): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    await this.homeService.deleteHome(id, userId);
    return ApiResponseDto.success('Home deleted successfully');
  }

  // Room endpoints
  @Post('rooms')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'images'),
        filename: (req, file, callback) => {
          if (file && file.originalname) {
            const fileUploadService = new FileUploadService();
            const uniqueName = fileUploadService.generateUniqueFileName(file.originalname);
            callback(null, uniqueName);
          } else {
            callback(new Error('Invalid file'), '');
          }
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async addRoomToHome(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req
  ): Promise<ApiResponseDto> {
    try {
      // Handle form-data type conversions (form-data sends everything as strings)
      if (typeof createRoomDto.homeId === 'string') {
        createRoomDto.homeId = parseInt(createRoomDto.homeId, 10);
      }
      if (typeof createRoomDto.price === 'string') {
        createRoomDto.price = parseFloat(createRoomDto.price);
      }
      if (createRoomDto.capacity && typeof createRoomDto.capacity === 'string') {
        createRoomDto.capacity = parseInt(createRoomDto.capacity, 10);
      }
      if (createRoomDto.isAvailable && typeof createRoomDto.isAvailable === 'string') {
        createRoomDto.isAvailable = createRoomDto.isAvailable === 'true';
      }

      // Handle ruleIds from form-data (may come as JSON string)
      if (createRoomDto.ruleIds && typeof createRoomDto.ruleIds === 'string') {
        try {
          createRoomDto.ruleIds = JSON.parse(createRoomDto.ruleIds as any);
        } catch {
          throw new BadRequestException('Invalid ruleIds format. Expected JSON array.');
        }
      }

      // Process uploaded files and add URLs to DTO
      if (files && files.length > 0) {
        // Validate files
        for (const file of files) {
          if (!this.fileUploadService.validateImageFile(file)) {
            throw new BadRequestException(`Invalid file: ${file.originalname}`);
          }
        }

        // Generate actual image URLs from uploaded files
        const imageUrls = files.map(
          file => `http://localhost:6001/uploads/images/${file.filename}`
        );
        createRoomDto.images = imageUrls;
      }

      // Use default user ID when authentication is disabled
      const userId = req.user?.id || 1;
      const room = await this.homeService.addRoomToHome(
        createRoomDto.homeId,
        createRoomDto,
        userId
      );
      return ApiResponseDto.created('Room added successfully', room);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  @Put('rooms/:roomId')
  async updateRoom(
    @Param('roomId') roomId: number,
    @Body() updateRoomDto: Partial<CreateRoomDto>,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const room = await this.homeService.updateRoom(roomId, updateRoomDto, userId);
    return ApiResponseDto.success('Room updated successfully', room);
  }

  @Delete('rooms/:roomId')
  async deleteRoom(@Param('roomId') roomId: number, @Request() req): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    await this.homeService.deleteRoom(roomId, userId);
    return ApiResponseDto.success('Room deleted successfully');
  }

  @Post('rules')
  async createRule(@Body() createRuleDto: CreateRuleDto): Promise<ApiResponseDto> {
    const rule = await this.homeService.createRule(createRuleDto);
    return ApiResponseDto.created('Rule created successfully', rule);
  }

  // Room rules endpoints
  @Post('rooms/:roomId/rules')
  async assignRuleToRoom(
    @Param('roomId') roomId: number,
    @Body() assignRuleDto: AssignRoomRuleDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const roomRule = await this.homeService.assignRuleToRoom(roomId, assignRuleDto, userId);
    return ApiResponseDto.created('Rule assigned to room successfully', roomRule);
  }

  @Put('rules/:ruleId')
  async updateRoomRule(
    @Param('ruleId') ruleId: number,
    @Body() assignRuleDto: AssignRoomRuleDto,
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    const roomRule = await this.homeService.updateRoomRule(ruleId, assignRuleDto, userId);
    return ApiResponseDto.success('Room rule updated successfully', roomRule);
  }

  @Delete('rules/:ruleId')
  async deleteRoomRule(@Param('ruleId') ruleId: number, @Request() req): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    await this.homeService.deleteRoomRule(ruleId, userId);
    return ApiResponseDto.success('Room rule deleted successfully');
  }

  // Image update endpoints
  @Patch(':id/images')
  async updateHomeImages(
    @Param('id') id: number,
    @Body() imageData: { image1?: string; image2?: string; image3?: string; image4?: string },
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    // Map image1, image2, ... to array if they exist
    const images = [imageData.image1, imageData.image2, imageData.image3, imageData.image4].filter(
      (img): img is string => !!img
    );
    const home = await this.homeService.updateHomeImages(id, { images }, userId);
    return ApiResponseDto.success('Home images updated successfully', home);
  }

  @Patch('rooms/:roomId/images')
  async updateRoomImages(
    @Param('roomId') roomId: number,
    @Body() imageData: { image1?: string; image2?: string; image3?: string; image4?: string },
    @Request() req
  ): Promise<ApiResponseDto> {
    // Use default user ID when authentication is disabled
    const userId = req.user?.id || 1;
    // Map image1, image2, ... to array if they exist
    const images = [imageData.image1, imageData.image2, imageData.image3, imageData.image4].filter(
      (img): img is string => !!img
    );
    const room = await this.homeService.updateRoomImages(roomId, { images }, userId);
    return ApiResponseDto.success('Room images updated successfully', room);
  }
}
