import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class VoteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, feedbackId: string) {
    const feedback = await this.prisma.feedback.findFirst({
      where: { id: feedbackId, deletedAt: null },
      select: { id: true },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return this.prisma.vote.upsert({
      where: { userId_feedbackId: { userId, feedbackId } },
      create: { userId, feedbackId },
      update: {},
    });
  }

  async remove(userId: string, feedbackId: string) {
    try {
      return await this.prisma.vote.delete({
        where: { userId_feedbackId: { userId, feedbackId } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Vote not found');
      }
      throw error;
    }
  }

  async listByFeedback(feedbackId: string) {
    return this.prisma.vote.findMany({
      where: { feedbackId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByFeedback(feedbackId: string) {
    return this.prisma.vote.count({
      where: { feedbackId },
    });
  }
}
