import { Controller, Get, Put, Query } from '@nestjs/common';
import { MeetingRecommendationService } from '../services/meeting-recommendation.service';

@Controller('api/meetings')
export class MeetingController {
  constructor(
    private readonly meetingRecommendationService: MeetingRecommendationService,
  ) {}

  // For testing the recommendation logic
  // @Get('recommendations')
  // async getRecommendations() {
  //   const mentorId = mockMentorId;
  //   const menteeId = mockMenteeId;
  //   return this.meetingRecommendationService.recommendMeeting(
  //     mentorId,
  //     menteeId,
  //   );
  // }

  @Put('confirm')
  async confirmAppointment(
    @Query('mentorId') mentorId: string,
    @Query('menteeId') menteeId: string,
  ) {
    return this.meetingRecommendationService.confirmMeeting(mentorId, menteeId);
  }

  @Put('reject')
  async rejectAppointment(
    @Query('mentorId') mentorId: string,
    @Query('menteeId') menteeId: string,
  ) {
    return this.meetingRecommendationService.rejectMeeting(mentorId, menteeId);
  }

  @Put('cancel')
  async cancelAppointment(
    @Query('mentorId') mentorId: string,
    @Query('menteeId') menteeId: string,
  ) {
    return this.meetingRecommendationService.cancelMeeting(mentorId, menteeId);
  }

  @Get()
  async getAppointments(@Query('mentorId') mentorId: string) {
    return this.meetingRecommendationService.getAppointments(mentorId);
  }
}
