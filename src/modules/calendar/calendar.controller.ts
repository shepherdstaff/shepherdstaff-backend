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
import { UpdateBlockedTimesRequestDto } from './dtos/update-blocked-times-request.dto';
import { BlockedTimeDto } from './dtos/blocked-time.dto';
import { plainToInstance } from 'class-transformer';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarSyncService: CalendarSyncService,
    private readonly configService: ConfigService,
  ) {}

  // TODO: for testing purposes, to be removed in production
  @Get('test-sync')
  @ApiOperation({
    summary: '[TEST] Test endpoint to sync calendar events for a user',
    description:
      'This endpoint is used to test the calendar synchronization functionality. It retrieves the latest calendar events for a user and returns them.',
  })
  async testSyncCalendar(@Query('userId') userId: string) {
    return this.calendarSyncService.retrieveLatestCalendarEvents(
      userId,
      DateTime.now().plus({ months: 1 }),
    );
  }

  @Get('start-google-oauth')
  @ApiOperation({
    summary: 'Initiate Google OAuth flow for calendar synchronization',
    description:
      'This endpoint starts the Google OAuth flow to allow the user to connect their Google Calendar account. Generates a link that the user should be redirected to on the frontend to authorize Google Calendar permissions.',
  })
  async startGoogleOAuth(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.initiateGoogleOAuth(userPayload);
  }

  @Public()
  @Get('google-oauth-callback')
  @Redirect()
  @ApiOperation({
    summary: 'Callback endpoint for Google OAuth',
    description:
      'This endpoint is called by Google OAuth after the user has authorized the application. It processes the authorization code and state returned by Google, and redirects the user to the frontend dashboard.',
  })
  async googleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    await this.calendarSyncService.googleOAuthCallback(code, state);
    return {
      url: `${process.env.FRONTEND_URL}/dashboard`,
      statusCode: 302,
    };
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
  @ApiOperation({
    summary: 'Get calendar options for a user',
    description:
      'This endpoint retrieves the calendar options for a user, i.e. which calendars are omitted from meeting recommendation consideration.',
  })
  async getCalendarOptions(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.getCalendarOptions(userPayload.userId);
  }

  @Post('update-blocked-times')
  @ApiOperation({
    summary:
      'Update the blocked times for a user, i.e. times when they are not available for meetings',
  })
  async updateBlockedTimes(
    @Req() req: Request,
    @Body() body: UpdateBlockedTimesRequestDto,
  ) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.updateBlockedTimes(
      userPayload.userId,
      plainToInstance(BlockedTimeDto, body.blockedTimes),
    );
  }

  @Get('blocked-times')
  @ApiOperation({
    summary: 'Get the blocked times for a user',
    description: `Blocked times are times when the user is not available for meetings. This is used to avoid scheduling meetings during these times. 
      Note that the startTime and endTime will be provided as a full ISO 8601 string, e.g. "2023-10-01T10:00:00Z", but we only use the time portion (i.e. "10:00:00Z or 10:00").`,
  })
  async getBlockedTimes(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return (
      await this.calendarSyncService.getBlockedTimes(userPayload.userId)
    ).map((blockedTime) => BlockedTimeDto.from(blockedTime));
  }
}
