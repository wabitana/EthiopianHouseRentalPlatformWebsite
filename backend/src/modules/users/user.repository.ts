import { prisma } from '../../config/database';
import { User, Role, Prisma } from '@prisma/client';

export class UserRepository {
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async findAll(skip = 0, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }
}
