import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  appointments,
  menteeAvailability,
  mentorAvailability,
  mentorToMenteeMap,
} from 'src/hacked-database';
import { AppointmentStatus } from 'src/interfaces/appointments';
import {
  CalendarEvent,
  RecommendedAvailabilities,
} from 'src/interfaces/availability';
import { AIService } from './ai.service';

@Injectable()
export class MeetingRecommendationService {
  constructor(@Inject(AIService) private aiService: AIService) {}

  async recommendMeeting(
    mentorId: string,
    menteeId: string,
  ): Promise<RecommendedAvailabilities> {
    const recommendations: RecommendedAvailabilities = {};

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

    recommendations[menteeId] = recommendation;
    appointments[mentorId][menteeId] = {
      id: Date.now().toString(),
      status: AppointmentStatus.PENDING,
      menteeId,
      mentorId,
      startDateTime: recommendation,
      endDateTime: new Date(recommendation.getTime() + 120 * 60 * 1000), // 2 hours
    };

    return recommendations;
  }

  private verifyRecommendation(
    mentorId: string,
    menteeId: string,
    recommendation: Date,
  ): boolean {
    // Check if the recommendation is within the mentee's availability
    const currentMenteeAvailability = menteeAvailability[menteeId];
    const hasClashMentee = currentMenteeAvailability.some(
      (event) =>
        recommendation >= event.startDateTime &&
        recommendation < event.endDateTime,
    );
    if (hasClashMentee) return false;

    // Check if the recommendation is within the mentor's availability
    const currentMentorAvailability = mentorAvailability[mentorId];
    const hasClashMentor = currentMentorAvailability.some(
      (event) =>
        recommendation >= event.startDateTime &&
        recommendation < event.endDateTime,
    );
    if (hasClashMentor) return false;

    return true;
  }

  confirmMeeting(mentorId: string, menteeId: string) {
    const appointment = appointments[mentorId][menteeId];
    appointment.status = AppointmentStatus.CONFIRMED;

    const appointmentCalendarEvent = new CalendarEvent(
      false,
      appointment.startDateTime,
      appointment.endDateTime,
      true,
    );

    mentorAvailability[mentorId].push(appointmentCalendarEvent);

    menteeAvailability[menteeId].push(appointmentCalendarEvent);
  }

  rejectMeeting(mentorId: string, menteeId: string) {
    const appointment = appointments[mentorId][menteeId];
    appointment.status = AppointmentStatus.REJECTED;

    const appointmentCalendarEvent = new CalendarEvent(
      false,
      appointment.startDateTime,
      appointment.endDateTime,
      false,
    );

    menteeAvailability[menteeId].push(appointmentCalendarEvent);
  }

  cancelMeeting(mentorId: string, menteeId: string) {
    const appointment = appointments[mentorId][menteeId];
    appointment.status = AppointmentStatus.CANCELLED;

    const appointmentCalendarEvent = new CalendarEvent(
      false,
      appointment.startDateTime,
      appointment.endDateTime,
      false,
    );

    menteeAvailability[menteeId].push(appointmentCalendarEvent);
  }

  completeMeeting(mentorId: string, menteeId: string) {
    const appointment = appointments[mentorId][menteeId];
    appointment.status = AppointmentStatus.COMPLETED;
  }

  private deleteMeeting(mentorId: string, menteeId: string) {
    delete appointments[mentorId][menteeId];
  }

  async getAppointments(mentorId: string) {
    return appointments[mentorId];
  }

  // NOTE: This method will constantly call ChatGPT, so please comment out if not testing the recommendation feature
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkAppointments() {
    const now = new Date();
    for (const mentorId in mentorToMenteeMap) {
      for (const menteeId of mentorToMenteeMap[mentorId]) {
        Logger.log(`Checking appointments - ${mentorId} - ${menteeId}`);
        const appointment = appointments[mentorId][menteeId];
        if (
          !appointment ||
          appointment.status === AppointmentStatus.REJECTED ||
          appointment.status === AppointmentStatus.CANCELLED
        ) {
          Logger.log(`Recommending meeting - ${mentorId} - ${menteeId}`);
          await this.recommendMeeting(mentorId, menteeId);
        } else if (
          appointment.status === AppointmentStatus.CONFIRMED &&
          now > appointment.endDateTime
        ) {
          Logger.log(`Completing meeting - ${mentorId} - ${menteeId}`);
          this.completeMeeting(mentorId, menteeId);
        } else if (
          appointment.status === AppointmentStatus.PENDING &&
          now > appointment.startDateTime
        ) {
          Logger.log(
            `Pending appointment lapsed, deleting appointment - ${mentorId} - ${menteeId}`,
          );
          this.deleteMeeting(mentorId, menteeId);
        }
      }
    }
  }
}
