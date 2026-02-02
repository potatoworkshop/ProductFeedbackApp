import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { VoteService } from './vote.service';

@Controller()
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('feedbacks/:feedbackId/votes')
  create(@Param('feedbackId') feedbackId: string) {
    const userId = 'placeholder-user';
    return this.voteService.create(userId, feedbackId);
  }

  @Get('feedbacks/:feedbackId/votes')
  list(@Param('feedbackId') feedbackId: string) {
    return this.voteService.listByFeedback(feedbackId);
  }

  @Get('feedbacks/:feedbackId/votes/count')
  async count(@Param('feedbackId') feedbackId: string) {
    const count = await this.voteService.countByFeedback(feedbackId);
    return { count };
  }

  @Delete('feedbacks/:feedbackId/votes')
  remove(@Param('feedbackId') feedbackId: string) {
    const userId = 'placeholder-user';
    return this.voteService.remove(userId, feedbackId);
  }
}
