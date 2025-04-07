import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './controllers/chat.controller';
import { MeetingController } from './controllers/meeting.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { MeetingRecommendationModule } from './modules/meeting-recommendation/meeting-recommendation.module';
import { SeederModule } from './modules/seed/seeder.module';
import { UserModule } from './modules/users/user.module';
import { AIService } from './services/ai.service';
import { MeetingRecommendationService } from './services/meeting-recommendation-legacy.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1',
      database: 'shepherdstaff',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    CalendarModule,
    AuthModule,
    DiscoveryModule,
    SeederModule,
    MeetingRecommendationModule,
  ],
  controllers: [ChatController, MeetingController],
  providers: [AIService, MeetingRecommendationService],
})
export class AppModule {}
