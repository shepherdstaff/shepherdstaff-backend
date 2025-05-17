import { Controller, Get, Query, Redirect, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DateTime } from 'luxon';
import { Public } from 'src/decorators/public.decorator';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { CalendarSyncService } from './calendar-sync.service';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarSyncService: CalendarSyncService,
    private readonly configService: ConfigService,
  ) {
    // TODO: need to find a way to retrieve redirect url from config and pass to decorator
    // redirectUrlAfterCalendarSync = this.configService.get<string>(
    //   'CALENDAR_SYNC_CALLBACK_REDIRECT_URL',
    // );
  }

  // TODO: for testing purposes, to be removed in production
  @Get('test-sync')
  async testSyncCalendar(@Query('userId') userId: string) {
    return this.calendarSyncService.retrieveLatestCalendarEvents(
      userId,
      DateTime.now().plus({ months: 1 }),
    );
  }

  @Get('start-google-oauth')
  async startGoogleOAuth(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.initiateGoogleOAuth(userPayload);
  }

  @Public()
  @Get('google-oauth-callback')
  @Redirect('http://localhost:5173/dashboard')
  async googleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.calendarSyncService.googleOAuthCallback(code, state);
  }
}
