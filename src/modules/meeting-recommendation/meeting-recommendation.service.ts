import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { ScheduleService } from '../calendar/schedule.service';
import { UserService } from '../users/services/user.service';
import { MeetingRecommendation } from './domain/meeting-recommendation.domain';
import { MeetingRecommendationRepository } from './meeting-recommendation.repository';
import { NotificationService } from '../notification/notification.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MeetingRecommendationService {
  constructor(
    private meetingRecommendationRepository: MeetingRecommendationRepository,
    private userService: UserService,
    private scheduleService: ScheduleService,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async ensureMeetingsComplete() {
    // Find all meetings that have endDateTime in the past and status is PENDING
    // Mark them as COMPLETED
    await this.meetingRecommendationRepository.completeAllPendingMeetings();
  }

  async completeMeetingsForMentor(mentorId: string) {
    await this.meetingRecommendationRepository.completeAllPendingMeetings(
      mentorId,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkForMeetingsToRecommend() {
    // Find last completed meeting for each mentor-mentee pair
    // Check meeting frequency preference for mentor-mentee pair (for now hard code to monthly)
    // If last meeting was more than a month ago, recommend a meeting
    //    Create meeting recommendation -> then send or queue in notification service
    const allMentors = await this.userService.getAllMentors();
    for (const mentor of allMentors) {
      const mentees = await this.userService.getMenteesForMentor(mentor.id);
      const existingOpenMeetingRecommendations =
        await this.getAllOpenMeetingRecommendations(mentor.id);
      for (const mentee of mentees) {
        if (
          existingOpenMeetingRecommendations.some(
            (meetingRecommendation) =>
              meetingRecommendation.toUserId === mentee.id,
          )
        ) {
          // Skip if there is already an open meeting recommendation for this mentee
          continue;
        }

        const lastCompletedMeeting = await this.retrieveLastCompletedMeeting(
          mentor.id,
          mentee.id,
        );

        if (!lastCompletedMeeting) {
          // No meeting has happened yet
          await this.recommendMeetings(mentor.id, mentee.id);
        } else {
          const lastMeetingDateTime = lastCompletedMeeting.endDateTime;
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

  async recommendMeetings(mentorId: string, menteeId: string) {
    // Call schedule service to sync latest calendar events
    await this.scheduleService.syncLatestCalendarEvents(mentorId);
    await this.scheduleService.syncLatestCalendarEvents(menteeId);

    // Get existing open meeting recommendation slots of mentor
    const existingOpenMeetingRecommendations =
      await this.meetingRecommendationRepository.findCurrentMeetingRecommendations(
        mentorId,
      );
    // Deconflict rejected meeting recommendations
    const rejectedMeetingRecommendations =
      await this.meetingRecommendationRepository.findRejectedMeetingRecommendations(
        mentorId,
        menteeId,
        DateTime.now().toJSDate(),
      );

    const reservedFreeSlots = [
      ...existingOpenMeetingRecommendations,
      ...rejectedMeetingRecommendations,
    ].map((meetingRecommendation) => ({
      startDateTime: meetingRecommendation.startDateTime,
      endDateTime: meetingRecommendation.endDateTime,
    }));

    // Find a free time slot for mentor and mentee
    const recommendedFreeSlots =
      await this.scheduleService.findFreeSlotsInSchedule(
        mentorId,
        menteeId,
        1, // TODO: Hardcoded to find 1 free slot for now, should check for user preferences
        reservedFreeSlots,
      );

    // Store recommended meetings in database, to prevent clashing recommendations for other mentees
    const userRelation = await this.userService.getUserRelation(
      mentorId,
      menteeId,
    );
    const userRelationId = userRelation.id;

    const newMeetingRecommendations = recommendedFreeSlots.map((freeSlot) => {
      return new MeetingRecommendation({
        fromUserId: mentorId,
        toUserId: menteeId,
        startDateTime: freeSlot.startDateTime,
        endDateTime: freeSlot.endDateTime,
        status: AppointmentStatus.PENDING,
      });
    });
    await this.meetingRecommendationRepository.saveMeetingRecommendations(
      userRelationId,
      newMeetingRecommendations,
    );

    // Notify mentor about recommended free slots
    const message =
      recommendedFreeSlots.length > 1
        ? `You have new meeting recommendations with ${menteeId}`
        : `You have a new meeting recommendation with ${menteeId} at ${recommendedFreeSlots[0].startDateTime.toFormat(
            'yyyy-MM-dd HH:mm',
          )}`;
    await this.notificationService.sendNotification(
      mentorId,
      'Meeting Recommendation',
      message,
    );

    Logger.log(
      `Meeting recommendations sent to mentor ${mentorId} for mentee ${menteeId}`,
    );
  }

  async getAllOpenMeetingRecommendations(mentorId: string) {
    return this.meetingRecommendationRepository.findCurrentMeetingRecommendations(
      mentorId,
    );
  }

  async declineMeetingRecommendation(
    mentorId: string,
    meetingRecommendationId: string,
  ) {
    // Verify if the meeting recommendation belongs to the mentor
    try {
      const meetingRecommendation =
        await this.meetingRecommendationRepository.findMeetingRecommendationById(
          meetingRecommendationId,
        );

      if (meetingRecommendation.fromUserId !== mentorId) {
        throw new Error('Meeting recommendation does not belong to the mentor');
      }
    } catch (error) {
      throw new Error(
        'Error declining meeting recommendation: ' + error.message,
      );
    }

    await this.meetingRecommendationRepository.updateMeetingRecommendationStatus(
      meetingRecommendationId,
      AppointmentStatus.REJECTED,
    );
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
    fromUserId: string,
    toUserId: string,
    meetingRecommendation: MeetingRecommendation,
    status: AppointmentStatus,
  ) {
    const userRelation = await this.userService.getUserRelation(
      fromUserId,
      toUserId,
    );

    await this.meetingRecommendationRepository.saveMeetingRecommendations(
      userRelation.id,
      [{ ...meetingRecommendation, status }],
    );
  }
}
