import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentController } from './comment/comment.controller';
import { FeedbackController } from './feedback/feedback.controller';
import { UserController } from './user/user.controller';
import { VoteController } from './vote/vote.controller';
import { CommentService } from './comment/comment.service';
import { FeedbackService } from './feedback/feedback.service';
import { PrismaService } from './common/prisma/prisma.service';
import { VoteService } from './vote/vote.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    FeedbackController,
    CommentController,
    VoteController,
    UserController,
  ],
  providers: [
    AppService,
    PrismaService,
    FeedbackService,
    CommentService,
    VoteService,
  ],
})
export class AppModule {}
