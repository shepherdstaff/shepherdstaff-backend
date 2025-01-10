import { Injectable } from '@nestjs/common';
import { EventEntity } from '../calendar/entities/event.entity';


@Injectable()
export class MeetingRecommendationService {

  // findAllPossibleMeetingTimeslots(
  //   freeSlots: EventEntity[],
  //   duration: number
  // ): EventEntity[] {
  //   // Convert duration to milliseconds
  //   const durationInMs = duration * 60 * 60 * 1000;

  //   // Filter free slots that are long enough to fit the meeting duration
  //   return freeSlots.filter(slot => {
  //     const start = slot.startDateTime.getTime();
  //     const end = slot.endDateTime.getTime();
  //     return (end - start) >= durationInMs;
  //   });
  // }
}
