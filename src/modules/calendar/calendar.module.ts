import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarSyncService } from './calendar-sync.service';
import { CalendarController } from './calendar.controller';
import { CalendarTokenEntity } from './entities/calendar-token.entity';
import { EventEntity } from './entities/event.entity';
import { CalendarTokenRepository } from './repositories/calendar-token.repository';
import { ScheduleRepository } from './repositories/schedule.repository';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EventEntity, CalendarTokenEntity]),
  ],
  controllers: [CalendarController],
  providers: [
    CalendarSyncService,
    ScheduleService,
    ScheduleRepository,
    CalendarTokenRepository,
  ],
  exports: [ScheduleService],
})
export class CalendarModule {}
