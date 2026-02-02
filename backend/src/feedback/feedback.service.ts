import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  ChangeFeedbackStatusDto,
  CreateFeedbackDto,
  FeedbackListQueryDto,
  UpdateFeedbackDto,
} from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        authorId,
      },
    });
  }

  async list(query: FeedbackListQueryDto) {
    const where: Prisma.FeedbackWhereInput = {
      deletedAt: null,
      status: query.status,
      category: query.category,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.FeedbackOrderByWithRelationInput[] = [];
    if (query.sort === 'votes') {
      orderBy.push({ votes: { _count: query.order ?? 'desc' } });
    } else if (query.sort === 'updatedAt') {
      orderBy.push({ updatedAt: query.order ?? 'desc' });
    } else {
      orderBy.push({ createdAt: query.order ?? 'desc' });
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.feedback.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { votes: true, comments: true } },
        },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getOne(id: string) {
    const feedback = await this.prisma.feedback.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { votes: true, comments: true } },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async update(id: string, dto: UpdateFeedbackDto) {
    try {
      return await this.prisma.feedback.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          category: dto.category,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Feedback not found');
      }
      throw error;
    }
  }

  async changeStatus(
    id: string,
    changedBy: string,
    dto: ChangeFeedbackStatusDto,
  ) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback || feedback.deletedAt) {
      throw new NotFoundException('Feedback not found');
    }

    if (feedback.status === dto.to) {
      return feedback;
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.feedback.update({
        where: { id },
        data: { status: dto.to },
      });
      await tx.feedbackStatusLog.create({
        data: {
          feedbackId: id,
          from: feedback.status,
          to: dto.to,
          changedBy,
        },
      });
      return updated;
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.feedback.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Feedback not found');
      }
      throw error;
    }
  }
}
