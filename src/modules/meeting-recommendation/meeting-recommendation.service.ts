import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { UserService } from '../users/services/user.service';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';
import { MeetingRecommendationRepository } from './meeting-recommendation.repository';

@Injectable()
export class MeetingRecommendationService {
  constructor(
    private meetingRecommendationRepository: MeetingRecommendationRepository,
    private userService: UserService,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async ensureMeetingsComplete() {
    // Find all meetings that have endDateTime in the past and status is PENDING
    // Mark them as COMPLETED
    await this.meetingRecommendationRepository.completeAllPendingMeetings();
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkForMeetingsToRecommend() {
    // Find last completed meeting for each mentor-mentee pair
    // Check meeting frequency preference for mentor-mentee pair (for now hard code to monthly)
    // If last meeting was more than a month ago, recommend a meeting
    //    Create meeting recommendation -> then send or queue in notification service
    const allMentors = await this.userService.getAllMentors();
    for (const mentor of allMentors) {
      const mentees = await this.userService.getMenteesForMentor(mentor.id);
      for (const mentee of mentees) {
        const lastCompletedMeeting = await this.retrieveLastCompletedMeeting(
          mentor.id,
          mentee.id,
        );

        if (!lastCompletedMeeting) {
          // No meeting has happened yet
          await this.recommendMeetings(mentor.id, mentee.id);
        } else {
          const lastMeetingDateTime = DateTime.fromJSDate(
            lastCompletedMeeting.endDateTime,
          );

          // TODO: compare with user preferences for mentee meeting frequency
          // for now - hardcoded to 1 month frequency
          const nextMeetingDateTime = lastMeetingDateTime.plus({ months: 1 });
          if (nextMeetingDateTime < DateTime.now()) {
            await this.recommendMeetings(mentor.id, mentee.id);
          }
        }
      }
    }
  }

  // TODO: Implement this method
  async recommendMeetings(mentorId: string, menteeId: string) {
    // Call schedule service to sync latest calendar events
    // Call schedule service to get latest calendar events stored in DB
    // Find a free time slot for mentor and mentee
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
