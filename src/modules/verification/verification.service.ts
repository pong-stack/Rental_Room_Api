import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, RequestStatus } from '../../entities/verification-request.entity';
import { Home } from '../../entities/home.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateVerificationRequestDto } from './dto/create-verification-request.dto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationRequest)
    private verificationRequestRepository: Repository<VerificationRequest>,
    @InjectRepository(Home)
    private homeRepository: Repository<Home>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createVerificationRequest(
    createDto: CreateVerificationRequestDto,
    userId: number
  ): Promise<VerificationRequest> {
    // Check if user is a home owner
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== UserRole.HOME_OWNER) {
      throw new ForbiddenException('Only home owners can request verification');
    }

    // Check if home exists and belongs to user
    const home = await this.homeRepository.findOne({
      where: { id: createDto.homeId, ownerId: userId },
    });

    if (!home) {
      throw new NotFoundException('Home not found or you do not own this home');
    }

    // Check if there's already a pending request for this home
    // If exists, cancel it before creating a new one (for testing convenience)
    const existingRequest = await this.verificationRequestRepository.findOne({
      where: { homeId: createDto.homeId, status: RequestStatus.PENDING },
    });

    if (existingRequest) {
      // Cancel the existing request before creating a new one
      await this.verificationRequestRepository.remove(existingRequest);
    }

    const request = this.verificationRequestRepository.create({
      homeId: createDto.homeId,
      requestedBy: userId,
      status: RequestStatus.PENDING,
    });

    return this.verificationRequestRepository.save(request);
  }

  async getMyVerificationRequests(userId: number): Promise<VerificationRequest[]> {
    return this.verificationRequestRepository.find({
      where: { requestedBy: userId },
      relations: ['home', 'home.rooms', 'home.rooms.rules', 'reviewer'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getVerificationRequestById(id: number, userId: number): Promise<VerificationRequest> {
    const request = await this.verificationRequestRepository.findOne({
      where: { id },
      relations: ['home', 'home.owner', 'home.rooms', 'home.rooms.rules', 'requester', 'reviewer'],
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    // Check if user owns the home or is admin
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (request.home.ownerId !== userId && (!user || user.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('You can only view your own verification requests');
    }

    return request;
  }

  async cancelVerificationRequest(id: number, userId: number): Promise<void> {
    const request = await this.verificationRequestRepository.findOne({
      where: { id, requestedBy: userId },
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ForbiddenException('Only pending requests can be cancelled');
    }

    await this.verificationRequestRepository.remove(request);
  }
}
