import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DateTime } from 'luxon';
import { Public } from 'src/decorators/public.decorator';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { CalendarSyncService } from './calendar-sync.service';
import { ApiOperation } from '@nestjs/swagger';
import { SetCalendarOptionsRequestDto } from './dtos/set-calendar-options-request.dto';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarSyncService: CalendarSyncService,
    private readonly configService: ConfigService,
  ) {}

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
  @Redirect(`${process.env.FRONTEND_URL}/dashboard`)
  async googleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.calendarSyncService.googleOAuthCallback(code, state);
  }

  @ApiOperation({
    summary:
      'Modify calendar options, i.e. choose which calendars to omit from meeting recommendation consideration',
  })
  @Post('calendar-options')
  async setCalendarOptions(
    @Req() req: Request,
    @Body() body: SetCalendarOptionsRequestDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);

    return this.calendarSyncService.setCalendarOptions(
      userPayload.userId,
      body.calendarsToOmit,
    );
  }

  @Get('calendar-options')
  async getCalendarOptions(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.getCalendarOptions(userPayload.userId);
  }
}
