import { Controller, Get, Query } from '@nestjs/common';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Controller('api/meeting-recommendation')
export class MeetingRecommendationController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  @Get('recommend-meeting')
  async getRecommendedMeetingSlots(
    @Query('mentorId') mentorId: string,
    @Query('menteeId') menteeId: string,
  ) {
    return this.meetingRecommendationService.recommendMeetings(
      mentorId,
      menteeId,
    );
  }
}
