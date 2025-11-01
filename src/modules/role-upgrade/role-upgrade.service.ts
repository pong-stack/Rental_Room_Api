import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RoleUpgradeRequest,
  UpgradeRequestStatus,
} from '../../entities/role-upgrade-request.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateRoleUpgradeRequestDto } from './dto/create-role-upgrade-request.dto';

@Injectable()
export class RoleUpgradeService {
  constructor(
    @InjectRepository(RoleUpgradeRequest)
    private roleUpgradeRequestRepository: Repository<RoleUpgradeRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createRoleUpgradeRequest(
    createDto: CreateRoleUpgradeRequestDto,
    userId: number
  ): Promise<RoleUpgradeRequest> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate requested role
    if (createDto.requestedRole === UserRole.USER) {
      throw new BadRequestException('Cannot request to downgrade to user role');
    }

    if (createDto.requestedRole === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot request admin role. Admin roles are assigned manually.');
    }

    // Check if user already has the requested role
    if (user.role === createDto.requestedRole) {
      throw new BadRequestException(`You already have the ${createDto.requestedRole} role`);
    }

    // Check if there's already a pending request for this user and role
    const existingRequest = await this.roleUpgradeRequestRepository.findOne({
      where: {
        userId: userId,
        requestedRole: createDto.requestedRole,
        status: UpgradeRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('You already have a pending request for this role');
    }

    const request = this.roleUpgradeRequestRepository.create({
      userId: userId,
      requestedRole: createDto.requestedRole,
      reason: createDto.reason,
      status: UpgradeRequestStatus.PENDING,
    });

    return this.roleUpgradeRequestRepository.save(request);
  }

  async getMyRoleUpgradeRequests(userId: number): Promise<RoleUpgradeRequest[]> {
    return this.roleUpgradeRequestRepository.find({
      where: { userId: userId },
      relations: ['user', 'reviewer'],
      order: { requestedAt: 'DESC' },
    });
  }

  async getRoleUpgradeRequestById(id: number, userId: number): Promise<RoleUpgradeRequest> {
    const request = await this.roleUpgradeRequestRepository.findOne({
      where: { id },
      relations: ['user', 'reviewer'],
    });

    if (!request) {
      throw new NotFoundException('Role upgrade request not found');
    }

    // Check if user owns the request or is admin
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (request.userId !== userId && (!user || user.role !== UserRole.ADMIN)) {
      throw new ForbiddenException('You can only view your own role upgrade requests');
    }

    return request;
  }

  async cancelRoleUpgradeRequest(id: number, userId: number): Promise<void> {
    const request = await this.roleUpgradeRequestRepository.findOne({
      where: { id, userId: userId },
    });

    if (!request) {
      throw new NotFoundException('Role upgrade request not found');
    }

    if (request.status !== UpgradeRequestStatus.PENDING) {
      throw new ForbiddenException('Only pending requests can be cancelled');
    }

    await this.roleUpgradeRequestRepository.remove(request);
  }

  // Admin methods
  async getAllRoleUpgradeRequests(): Promise<RoleUpgradeRequest[]> {
    return this.roleUpgradeRequestRepository.find({
      relations: ['user', 'reviewer'],
      order: { requestedAt: 'DESC' },
    });
  }

  async reviewRoleUpgradeRequest(
    id: number,
    status: UpgradeRequestStatus,
    adminComment: string | null,
    adminId: number
  ): Promise<RoleUpgradeRequest> {
    const request = await this.roleUpgradeRequestRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!request) {
      throw new NotFoundException('Role upgrade request not found');
    }

    if (request.status !== UpgradeRequestStatus.PENDING) {
      throw new ForbiddenException('This role upgrade request has already been reviewed');
    }

    // Update request
    request.status = status;
    request.adminComment = adminComment || '';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    // If approved, update user role
    if (status === UpgradeRequestStatus.APPROVED) {
      const user = await this.userRepository.findOne({ where: { id: request.userId } });
      if (user) {
        user.role = request.requestedRole;
        await this.userRepository.save(user);
      }
    }

    return this.roleUpgradeRequestRepository.save(request);
  }
}
