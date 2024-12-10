import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { CalendarSyncService } from './calendar-sync.service';

@Controller('api/calendar')
export class CalendarController {
  constructor(private readonly calendSyncService: CalendarSyncService) {}

  // @Post('sync')
  // async syncCalendar(
  //   @Body() body: { token: string; userType: UserType; userId: string },
  // ) {
  //   return this.calendarSyncService.syncCalendar(
  //     body.token,
  //     body.userType,
  //     body.userId,
  //   );
  // }

  @Get('start-google-oauth')
  async startGoogleOAuth(@Req() req: Request) {
    const userPayload = retrieveUserInfoFromRequest(req);
    return this.calendarSyncService.initiateGoogleOAuth(userPayload);
  }

  @Public()
  @Get('google-oauth-callback')
  async googleOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.calendarSyncService.googleOAuthCallback(code, state);
  }
}
