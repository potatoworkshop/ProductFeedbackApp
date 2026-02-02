import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ChangeFeedbackStatusDto,
  CreateFeedbackDto,
  FeedbackListQueryDto,
  UpdateFeedbackDto,
} from './dto/feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  create(@Body() body: CreateFeedbackDto) {
    const authorId = 'placeholder-user';
    return this.feedbackService.create(authorId, body);
  }

  @Get()
  list(@Query() query: FeedbackListQueryDto) {
    return this.feedbackService.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.feedbackService.getOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateFeedbackDto) {
    return this.feedbackService.update(id, body);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() body: ChangeFeedbackStatusDto) {
    const adminId = 'placeholder-admin';
    return this.feedbackService.changeStatus(id, adminId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(id);
  }
}
