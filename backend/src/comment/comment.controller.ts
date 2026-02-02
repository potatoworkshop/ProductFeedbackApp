import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateCommentDto } from './dto/comment.dto';
import { CommentService } from './comment.service';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('feedbacks/:feedbackId/comments')
  create(
    @Param('feedbackId') feedbackId: string,
    @Body() body: CreateCommentDto,
  ) {
    const authorId = 'placeholder-user';
    return this.commentService.create(authorId, feedbackId, body);
  }

  @Get('feedbacks/:feedbackId/comments')
  list(@Param('feedbackId') feedbackId: string) {
    return this.commentService.listTreeByFeedback(feedbackId);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
