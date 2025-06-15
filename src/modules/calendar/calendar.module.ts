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
import { CalendarOmissionRepository } from './repositories/calendar-omission.repository';
import { CalendarOmissionEntity } from './entities/calendar-omission.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      EventEntity,
      CalendarTokenEntity,
      CalendarOmissionEntity,
    ]),
  ],
  controllers: [CalendarController],
  providers: [
    CalendarSyncService,
    ScheduleService,
    ScheduleRepository,
    CalendarTokenRepository,
    CalendarOmissionRepository,
  ],
  exports: [ScheduleService],
})
export class CalendarModule {}
