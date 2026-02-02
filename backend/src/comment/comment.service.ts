import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, type Comment } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

type CommentNode = Comment & {
  replies: CommentNode[];
  replyCount: number;
};

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, feedbackId: string, dto: CreateCommentDto) {
    const feedback = await this.prisma.feedback.findFirst({
      where: { id: feedbackId, deletedAt: null },
      select: { id: true },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { feedbackId: true, deletedAt: true },
      });

      if (!parent || parent.deletedAt) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parent.feedbackId !== feedbackId) {
        throw new BadRequestException('Parent comment mismatch');
      }
    }

    return this.prisma.comment.create({
      data: {
        body: dto.body,
        feedbackId,
        authorId,
        parentId: dto.parentId ?? null,
      },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.comment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Comment not found');
      }
      throw error;
    }
  }

  async listByFeedback(feedbackId: string) {
    return this.prisma.comment.findMany({
      where: { feedbackId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listTreeByFeedback(feedbackId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { feedbackId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    const byId = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    for (const comment of comments) {
      byId.set(comment.id, { ...comment, replies: [], replyCount: 0 });
    }

    for (const comment of comments) {
      const node = byId.get(comment.id);
      if (node && comment.parentId && byId.has(comment.parentId)) {
        const parent = byId.get(comment.parentId);
        if (parent) {
          parent.replies.push(node);
          parent.replyCount += 1;
        }
      } else {
        if (node) {
          roots.push(node);
        }
      }
    }

    return roots;
  }
}
