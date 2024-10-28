import { Controller, Post, Body } from '@nestjs/common';
import { CalendarSyncService } from '../services/calendar-sync.service';

@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendarSyncService: CalendarSyncService) {}

  @Post('sync')
  async syncCalendar(
    @Body() body: { token: string; userType: 'mentor' | 'mentee'; userId: string }
  ) {
    return this.calendarSyncService.syncCalendar(
      body.token,
      body.userType,
      body.userId
    );
  }
}