import { UserRepository } from './user.repository';
import { NotFoundError } from '../../utils/errors';
import { UpdateProfileDTO, UpdateRolesDTO, UserResponse } from './user.types';
import { parsePagination, formatPaginatedMeta } from '../../utils/pagination';

export class UserService {
  static async getProfile(userId: string): Promise<UserResponse> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.mapToResponse(user);
  }

  static async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<UserResponse> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await UserRepository.update(userId, dto);
    return this.mapToResponse(updated);
  }

  static async updateUserRoles(userId: string, dto: UpdateRolesDTO): Promise<UserResponse> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await UserRepository.update(userId, { roles: dto.roles });
    return this.mapToResponse(updated);
  }

  static async getAllUsers(page = 1, limit = 10) {
    const pagination = parsePagination({ page, limit });
    const { users, total } = await UserRepository.findAll(pagination.skip, pagination.limit);

    return {
      users: users.map(this.mapToResponse),
      meta: formatPaginatedMeta(total, pagination.page, pagination.limit),
    };
  }

  private static mapToResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      avatarUrl: user.avatarUrl,
      isPhoneVerified: user.isPhoneVerified,
      isEmailVerified: user.isEmailVerified,
      isIdentityVerified: user.isIdentityVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
