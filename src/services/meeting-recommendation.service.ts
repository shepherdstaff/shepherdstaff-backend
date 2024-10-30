import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  appointmentsDb,
  menteeAvailabilityDb,
  mentorAvailabilityDb,
  mentorToMenteeMapDb,
} from 'src/hacked-database';
import { AppointmentStatus } from 'src/interfaces/appointments';
import { CalendarEvent } from 'src/interfaces/availability';
import { AIService } from './ai.service';

@Injectable()
export class MeetingRecommendationService {
  constructor(@Inject(AIService) private aiService: AIService) {}

  async recommendMeeting(mentorId: string, menteeId: string): Promise<Date> {
    let recommendation = await this.aiService.generateRecommendedDate(
      mentorId,
      menteeId,
    );

    const isValidRecommendation = this.verifyRecommendation(
      mentorId,
      menteeId,
      recommendation,
    );
    if (!isValidRecommendation) {
      Logger.warn(
        `Invalid recommendation ${recommendation.toISOString()}, trying again`,
        'MeetingRecommendationService',
      );
      // Try again once - we are on a budget so we limit to one retry
      recommendation = await this.aiService.generateRecommendedDate(
        mentorId,
        menteeId,
      );
    }

    appointmentsDb[mentorId][menteeId] = {
      id: Date.now().toString(),
      status: AppointmentStatus.PENDING,
      menteeId,
      mentorId,
      startDateTime: recommendation,
      endDateTime: new Date(recommendation.getTime() + 120 * 60 * 1000), // 2 hours
    };

    const appointmentCalendarEvent = new CalendarEvent(
      false,
      recommendation,
      new Date(recommendation.getTime() + 120 * 60 * 1000),
      AppointmentStatus.PENDING,
    );

    mentorAvailabilityDb[mentorId].push(appointmentCalendarEvent);

    menteeAvailabilityDb[menteeId].push(appointmentCalendarEvent);

    return recommendation;
  }

  private verifyRecommendation(
    mentorId: string,
    menteeId: string,
    recommendation: Date,
  ): boolean {
    // Check if the recommendation is within the mentee's availability
    const currentMenteeAvailability = menteeAvailabilityDb[menteeId];
    const hasClashMentee = currentMenteeAvailability.some(
      (event) =>
        recommendation >= event.startDateTime &&
        recommendation < event.endDateTime,
    );
    if (hasClashMentee) return false;

    // Check if the recommendation is within the mentor's availability
    const currentMentorAvailability = mentorAvailabilityDb[mentorId];
    const hasClashMentor = currentMentorAvailability.some(
      (event) =>
        recommendation >= event.startDateTime &&
        recommendation < event.endDateTime,
    );
    if (hasClashMentor) return false;

    return true;
  }

  private findCalendarEventIndexInMentorAvailabilities(
    mentorId: string,
    meetingStatus: AppointmentStatus,
    startDateTime: Date,
  ) {
    return mentorAvailabilityDb[mentorId].findIndex(
      (event) =>
        event.appointmentStatus === meetingStatus &&
        event.startDateTime === startDateTime,
    );
  }

  private findCalendarEventInMenteeAvailabilities(
    menteeId: string,
    meetingStatus: AppointmentStatus,
    startDateTime: Date,
  ) {
    return menteeAvailabilityDb[menteeId].find(
      (event) =>
        event.appointmentStatus === meetingStatus &&
        event.startDateTime === startDateTime,
    );
  }

  rejectMeeting(mentorId: string, menteeId: string) {
    const appointment = appointmentsDb[mentorId][menteeId];
    appointment.status = AppointmentStatus.REJECTED;

    // Update calendar event statuses
    const mentorCalendarEventIndex =
      this.findCalendarEventIndexInMentorAvailabilities(
        mentorId,
        AppointmentStatus.PENDING,
        appointment.startDateTime,
      );
    mentorAvailabilityDb[mentorId].splice(mentorCalendarEventIndex, 1);

    const menteeCalendarEvent = this.findCalendarEventInMenteeAvailabilities(
      menteeId,
      AppointmentStatus.PENDING,
      appointment.startDateTime,
    );

    menteeCalendarEvent.appointmentStatus = null;
  }

  completeMeeting(mentorId: string, menteeId: string) {
    const appointment = appointmentsDb[mentorId][menteeId];
    appointment.status = AppointmentStatus.COMPLETED;
  }

  async getAppointments(mentorId: string) {
    return appointmentsDb[mentorId];
  }

  // NOTE: This method will constantly call ChatGPT, so please comment out if not testing the recommendation feature
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAppointments() {
    const now = new Date();
    for (const mentorId in mentorToMenteeMapDb) {
      for (const menteeId of mentorToMenteeMapDb[mentorId]) {
        Logger.log(`Checking appointments - ${mentorId} - ${menteeId}`);
        const appointment = appointmentsDb[mentorId][menteeId];
        if (!appointment || appointment.status === AppointmentStatus.REJECTED) {
          Logger.log(`Recommending meeting - ${mentorId} - ${menteeId}`);
          await this.recommendMeeting(mentorId, menteeId);
        } else if (
          appointment.status === AppointmentStatus.PENDING &&
          now > appointment.endDateTime
        ) {
          Logger.log(`Completing meeting - ${mentorId} - ${menteeId}`);
          this.completeMeeting(mentorId, menteeId);
        }
      }
    }
  }
}
