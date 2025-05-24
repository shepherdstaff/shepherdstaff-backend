import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { MeetingRecommendationModule } from './modules/meeting-recommendation/meeting-recommendation.module';
import { SeederModule } from './modules/seed/seeder.module';
import { UserModule } from './modules/users/user.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DateScraperModule } from './modules/date-scraper/date-scraper.module';

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
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UserModule,
    CalendarModule,
    AuthModule,
    DiscoveryModule,
    SeederModule,
    MeetingRecommendationModule,
    NotificationModule,
    DateScraperModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
