import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AdminService } from './admin.service';
import { PrismaService } from '../shared/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const prismaMock = {
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const i18nServiceMock = {
    t: jest.fn((key: string) => key),
  };

  const mockUsers = [
    {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      isActive: true,
      emailVerified: true,
      isAdmin: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'user-2',
      name: 'Bob',
      email: 'bob@example.com',
      isActive: false,
      emailVerified: true,
      isAdmin: false,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'user-3',
      name: 'Carol',
      email: 'carol@example.com',
      isActive: true,
      emailVerified: false,
      isAdmin: false,
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: I18nService, useValue: i18nServiceMock },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return correct user counts', async () => {
      (prismaService.user.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);

      const result = await service.getStats();

      expect(result).toEqual({
        totalUsers: 10,
        activeUsers: 8,
        inactiveUsers: 2,
      });
      expect(prismaService.user.count).toHaveBeenCalledTimes(3);
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { isActive: false },
      });
    });
  });

  describe('getUsers', () => {
    it('should return all users ordered by createdAt desc', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await service.getUsers();

      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          emailVerified: true,
          isAdmin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      const adminId = 'admin-id';
      const targetId = 'user-2';
      const updatedUser = { ...mockUsers[1], isActive: true };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
        mockUsers[1],
      );
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateUserStatus(adminId, targetId, true);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: targetId },
        data: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          emailVerified: true,
          isAdmin: true,
          createdAt: true,
        },
      });
    });

    it('should throw ForbiddenException when admin tries to deactivate self', async () => {
      const adminId = 'user-1';

      await expect(
        service.updateUserStatus(adminId, adminId, false),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateUserStatus(adminId, adminId, false),
      ).rejects.toThrow('admin.errors.cannotDeactivateSelf');
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      const adminId = 'admin-id';
      const targetId = 'nonexistent-id';

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateUserStatus(adminId, targetId, false),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.updateUserStatus(adminId, targetId, false),
      ).rejects.toThrow('admin.errors.userNotFound');
    });
  });
});
