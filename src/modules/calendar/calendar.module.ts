import { Module } from '@nestjs/common';
import { CalendarSyncService } from './calendar-sync.service';
import { CalendarController } from './calendar.controller';

@Module({
  controllers: [CalendarController],
  providers: [CalendarSyncService],
})
export class CalendarModule {}
