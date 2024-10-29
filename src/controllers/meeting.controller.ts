import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { mockMentorId } from 'src/hacked-database';
import { MeetingStatus } from '../entities/meeting.entity';
import { MeetingRecommendationService } from '../services/meeting-recommendation.service';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  @Get('recommendations')
  async getRecommendations() {
    // TODO: Get actual mentor ID from authentication
    const mentorId = mockMentorId;
    return this.meetingRecommendationService.recommendMeetings(mentorId);
  }

  @Patch(':id')
  async updateMeetingStatus(
    @Param('id') id: string,
    @Body() { status }: { status: MeetingStatus },
  ) {
    // TODO: Implement status update logic
    return { id, status };
  }
}
