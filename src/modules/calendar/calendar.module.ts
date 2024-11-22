import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CalendarSyncService } from './calendar-sync.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [ConfigModule],
  controllers: [CalendarController],
  providers: [CalendarSyncService],
})
export class CalendarModule {}
