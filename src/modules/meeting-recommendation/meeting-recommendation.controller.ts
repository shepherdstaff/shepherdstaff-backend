import { Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { MeetingRecommendationService } from './meeting-recommendation.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('meeting-recommendation')
export class MeetingRecommendationController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  // For testing the recommendation logic
  @Get('recommend-meeting')
  @ApiOperation({
    summary: '[TEST] Get recommended meeting slots for a mentor and mentee',
    description:
      'This endpoint syncs both mentor and mentee calendars, and then generates recommended meeting slots. It is primarily used for testing the meeting recommendation logic, but can be used to force meeting recommendations to run apart from the cron job.',
  })
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
  @ApiOperation({
    summary: 'Get all open meeting recommendations for a mentor',
    description:
      'This endpoint retrieves all open meeting recommendations for a specified mentor.',
  })
  async getAllOpenMeetingRecommendations(@Query('mentorId') mentorId: string) {
    return this.meetingRecommendationService.getAllOpenMeetingRecommendations(
      mentorId,
    );
  }

  @Patch('decline')
  @ApiOperation({
    summary: 'Decline a meeting recommendation',
    description:
      'This endpoint allows a mentor to decline a specific meeting recommendation by its ID.',
  })
  async declineMeetingRecommendation(
    @Query('mentorId') mentorId: string,
    @Query('meetingRecommendationId') meetingRecommendationId: string,
  ) {
    return this.meetingRecommendationService.declineMeetingRecommendation(
      mentorId,
      meetingRecommendationId,
    );
  }

  @Post('complete-meetings')
  @ApiOperation({
    summary:
      'Complete all open meeting recommendations older than the current timestamp for a mentor',
    description:
      'This endpoint marks all open meeting recommendations older than the current timestamp as complete for a specified mentor. Should be periodically called by frontend to force completion of meetings, apart from the cron job on the backend.',
  })
  async completeMeetings(@Query('mentorId') mentorId: string) {
    return this.meetingRecommendationService.completeMeetingsForMentor(
      mentorId,
    );
  }
}
