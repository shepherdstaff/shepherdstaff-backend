import { Inject, Injectable } from '@nestjs/common';
import { menteeAvailability } from 'src/hacked-database';
import { RecommendedAvailabilities } from 'src/interfaces/availability';
import { AIService } from './ai.service';

@Injectable()
export class MeetingRecommendationService {
  constructor(@Inject(AIService) private aiService: AIService) {}

  async recommendMeetings(
    mentorId: string,
  ): Promise<RecommendedAvailabilities> {
    const recommendations: RecommendedAvailabilities = {};

    for (const menteeId in menteeAvailability) {
      // const lastMeeting = await this.getLastMeeting(mentee.id);
      // const nextMeetingDate = this.calculateNextMeetingDate(
      //   lastMeeting,
      //   mentee.meetingFrequencyDays,
      // );
      // if (nextMeetingDate) {
      //   const availableSlot = await this.findAvailableSlot(
      //     mentee,
      //     nextMeetingDate,
      //   );
      //   if (availableSlot) {
      //     const meeting = this.meetingRepository.create({
      //       dateTime: availableSlot,
      //       status: MeetingStatus.RECOMMENDED,
      //       mentee,
      //     });
      //     recommendations.push(meeting);
      //   }
      // }
      const recommendation = await this.aiService.generateRecommendedDate(
        mentorId,
        menteeId,
      );
      recommendations[menteeId] = recommendation;
    }

    return recommendations;
  }

  // private async getLastMeeting(menteeId: string): Promise<Meeting | null> {
  //   return await this.meetingRepository.findOne({
  //     where: {
  //       mentee: { id: menteeId },
  //       status: MeetingStatus.MET,
  //     },
  //     order: { dateTime: 'DESC' },
  //   });
  // }

  // private calculateNextMeetingDate(
  //   lastMeeting: Meeting | null,
  //   frequencyDays: number,
  // ): Date {
  //   const baseDate = lastMeeting ? lastMeeting.dateTime : new Date();
  //   return addDays(baseDate, frequencyDays);
  // }

  // private async findAvailableSlot(
  //   mentee: Mentee,
  //   targetDate: Date,
  // ): Promise<Date | null> {
  //   const dayOfWeek = format(targetDate, 'EEEE').toLowerCase();
  //   const menteeSchedule = mentee.availability.weeklySchedule[dayOfWeek];

  //   if (!menteeSchedule) return null;

  //   // Check exceptions
  //   const isException = mentee.availability.exceptions.find(
  //     (ex) =>
  //       format(parseISO(ex.date), 'yyyy-MM-dd') ===
  //       format(targetDate, 'yyyy-MM-dd'),
  //   );
  //   if (isException && !isException.available) return null;

  //   // Find first available slot
  //   for (const slot of menteeSchedule) {
  //     const startTime = parseISO(
  //       `${format(targetDate, 'yyyy-MM-dd')}T${slot.start}`,
  //     );
  //     const endTime = parseISO(
  //       `${format(targetDate, 'yyyy-MM-dd')}T${slot.end}`,
  //     );

  //     const existingMeeting = await this.meetingRepository.findOne({
  //       where: {
  //         // dateTime: isWithinInterval(new Date(), {
  //         //   start: startTime,
  //         //   end: endTime,
  //         // }),
  //         dateTime: And(MoreThan(startTime), LessThan(endTime)),
  //       },
  //     });

  //     if (!existingMeeting) {
  //       return startTime;
  //     }
  //   }

  //   return null;
  // }
}
