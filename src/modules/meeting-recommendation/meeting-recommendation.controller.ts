import { Controller, Get, Query } from '@nestjs/common';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Controller('api/meeting-recommendation')
export class MeetingRecommendationController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  // For testing the recommendation logic
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

  @Get('all')
  async getAllOpenMeetingRecommendations(@Query('mentorId') mentorId: string) {
    return this.meetingRecommendationService.getAllOpenMeetingRecommendations(
      mentorId,
    );
  }
}
