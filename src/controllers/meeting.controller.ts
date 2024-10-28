import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { MeetingRecommendationService } from '../services/meeting-recommendation.service';
import { MeetingStatus } from '../entities/meeting.entity';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  @Get('recommendations')
  async getRecommendations() {
    // TODO: Get actual mentor ID from authentication
    const mentorId = 'current-mentor-id';
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