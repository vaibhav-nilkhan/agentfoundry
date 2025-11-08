import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateSkillDto, UpdateSkillDto, SkillQueryDto } from './dto';
import { SkillStatus } from '@agentfoundry/shared';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: SkillQueryDto) {
    const { page = 1, limit = 20, category, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by approved status by default (unless admin query)
    if (!status) {
      where.status = SkillStatus.APPROVED;
    } else {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [skills, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              verified: true,
              reputation: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: [{ downloads: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.skill.count({ where }),
    ]);

    return {
      skills,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
            reputation: true,
            bio: true,
            website: true,
          },
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        validationResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async create(createSkillDto: CreateSkillDto, userId: string) {
    // Check if user exists in our database
    let user = await this.prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    // If user doesn't exist, this will fail - they should be created on first auth
    if (!user) {
      throw new BadRequestException('User profile not found. Please complete registration.');
    }

    // Generate slug from name
    const slug = createSkillDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const skill = await this.prisma.skill.create({
      data: {
        ...createSkillDto,
        slug,
        authorId: user.id,
        status: SkillStatus.PENDING,
      },
      include: {
        author: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, userId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Check if user is the author
    if (skill.author.firebaseUid !== userId) {
      throw new ForbiddenException('You can only update your own skills');
    }

    const updated = await this.prisma.skill.update({
      where: { id },
      data: updateSkillDto,
      include: {
        author: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Check if user is the author
    if (skill.author.firebaseUid !== userId) {
      throw new ForbiddenException('You can only delete your own skills');
    }

    await this.prisma.skill.delete({
      where: { id },
    });

    return { message: 'Skill deleted successfully' };
  }
}
