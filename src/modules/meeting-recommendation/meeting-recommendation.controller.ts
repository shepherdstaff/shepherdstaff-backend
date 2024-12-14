import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MeetingRecommendationService } from './meeting-recommendation.service';

@Controller('api/meeting-recommendation')
export class MeetingRecommendationController {
  constructor(private readonly meetingRecommendationService: MeetingRecommendationService) {}

  // @Get('recommend-meeting')
  // async getRecommendedMeetingSlots(
  //   @Query('menteeId') menteeId: string,
  //   @Query('duration') duration: string,
  //   @Req() req: Request
  // ) {
  //   try {
  //     const durationInHours = parseFloat(duration);

  //     if (isNaN(durationInHours) || durationInHours <= 0) {
  //       return { error: 'Invalid duration. Please provide a valid positive number.' };
  //     }

  //     // Fetch the list of busy timeslots for the given mentee
  //     // (This assumes there's a method to get busy timeslots by menteeId)
  //     const busyTimeslots = await this.meetingRecommendationService.getMenteeBusyTimeslots(menteeId);

  //     // Get the free timeslots from the busy timeslots
  //     const freeSlots = this.meetingRecommendationService.findFreeSlotFromListOfBusyTimeslots(busyTimeslots);

  //     // Find all possible meeting timeslots that match the specified duration
  //     const possibleMeetingSlots = this.meetingRecommendationService.findAllPossibleMeetingTimeslots(freeSlots, durationInHours);

  //     return { menteeId, possibleMeetingSlots };
  //   } catch (error) {
  //     return { error: 'An error occurred while fetching meeting slots.', details: error.message };
  //   }
  // }
}