import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarSyncService } from './calendar-sync.service';
import { CalendarController } from './calendar.controller';
import { EventEntity } from './entities/event.entity';
import { ScheduleRepository } from './repositories/schedule.repository';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EventEntity])],
  controllers: [CalendarController],
  providers: [CalendarSyncService, ScheduleService, ScheduleRepository],
})
export class CalendarModule {}
