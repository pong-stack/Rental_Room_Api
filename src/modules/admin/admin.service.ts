import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, RequestStatus } from '../../entities/verification-request.entity';
import { Home, VerificationStatus } from '../../entities/home.entity';
import { User, UserRole } from '../../entities/user.entity';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(VerificationRequest)
    private verificationRequestRepository: Repository<VerificationRequest>,
    @InjectRepository(Home)
    private homeRepository: Repository<Home>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getAllVerificationRequests(): Promise<VerificationRequest[]> {
    return this.verificationRequestRepository.find({
      relations: ['home', 'home.owner', 'requester', 'reviewer'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getVerificationRequestById(id: number): Promise<VerificationRequest> {
    const request = await this.verificationRequestRepository.findOne({
      where: { id },
      relations: ['home', 'home.owner', 'home.rooms', 'home.rooms.rules', 'requester', 'reviewer'],
    });

    if (!request) {
      throw new NotFoundException('Verification request not found');
    }

    return request;
  }

  async reviewVerificationRequest(
    id: number,
    reviewDto: ReviewVerificationDto,
    adminId: number
  ): Promise<VerificationRequest> {
    const request = await this.getVerificationRequestById(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new ForbiddenException('This verification request has already been reviewed');
    }

    // Update verification request
    request.status = reviewDto.status;
    request.adminComment = reviewDto.adminComment || '';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    const updatedRequest = await this.verificationRequestRepository.save(request);

    // Update home verification status
    const home = await this.homeRepository.findOne({ where: { id: request.homeId } });
    if (home) {
      home.verificationStatus =
        reviewDto.status === RequestStatus.APPROVED
          ? VerificationStatus.APPROVED
          : VerificationStatus.REJECTED;
      await this.homeRepository.save(home);
    }

    return updatedRequest;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'fullName', 'email', 'role', 'phoneNumber', 'createdAt'],
    });
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'role', 'phoneNumber', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserRole(id: number, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async getAllHomes(): Promise<Home[]> {
    return this.homeRepository.find({
      relations: ['owner', 'rooms', 'rooms.rules'],
    });
  }

  async getHomeById(id: number): Promise<Home> {
    const home = await this.homeRepository.findOne({
      where: { id },
      relations: ['owner', 'rooms', 'rooms.rules'],
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return home;
  }

  async getStatistics() {
    const totalUsers = await this.userRepository.count();
    const totalHomes = await this.homeRepository.count();
    const pendingRequests = await this.verificationRequestRepository.count({
      where: { status: RequestStatus.PENDING },
    });
    const approvedHomes = await this.homeRepository.count({
      where: { verificationStatus: VerificationStatus.APPROVED },
    });

    return {
      totalUsers,
      totalHomes,
      pendingVerificationRequests: pendingRequests,
      approvedHomes,
    };
  }
}
