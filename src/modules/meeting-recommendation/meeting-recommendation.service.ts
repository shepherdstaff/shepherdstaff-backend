import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';
import { MeetingRecommendationRepository } from './meeting-recommendation.repository';

@Injectable()
export class MeetingRecommendationService {
  constructor(
    private meetingRecommendationRepository: MeetingRecommendationRepository,
  ) {}

  // TODO: Implement following cron jobs

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async ensureMeetingsComplete() {
    // Find all meetings that have endDateTime in the past and status is PENDING
    // Mark them as COMPLETED
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkForMeetingsToRecommend() {
    // Find last completed meeting for each mentor-mentee pair
    // Check meeting frequency preference for mentor-mentee pair (for now hard code to monthly)
    // If last meeting was more than a month ago, recommend a meeting
    //    Create meeting recommendation -> then send or queue in notification service
  }

  private async retrieveLastCompletedMeeting(
    mentorId: string,
    menteeId: string,
  ) {
    return this.meetingRecommendationRepository.findLastCompletedMeeting(
      mentorId,
      menteeId,
    );
  }

  async updateMeetingRecommendation(
    meetingRecommendation: MeetingRecommendation,
    status: AppointmentStatus,
  ) {
    await this.meetingRecommendationRepository.saveMeetingRecommendation({
      ...meetingRecommendation,
      status,
    });
  }

  async createMeetingRecommendation(
    fromUserId: string,
    toUserId: string,
    startDateTime: DateTime,
    endDateTime: DateTime,
  ): Promise<MeetingRecommendation> {
    const meetingRecommendation = new MeetingRecommendation({
      fromUserId,
      toUserId,
      startDateTime: startDateTime.toJSDate(),
      endDateTime: endDateTime.toJSDate(),
      status: AppointmentStatus.PENDING,
    });

    return this.meetingRecommendationRepository.saveMeetingRecommendation(
      meetingRecommendation,
    );
  }
}
