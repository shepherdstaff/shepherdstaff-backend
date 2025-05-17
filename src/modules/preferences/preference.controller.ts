import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PreferenceService } from './preference.service';

@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get('/:userId')
  async getGlobalPreferences(@Param('userId') userId: string) {
    return this.preferenceService.getGlobalPreferences(userId);
  }

  @Get('/:userId/:menteeId')
  async getSpecificMenteePreferences(
    @Param('userId') userId: string,
    @Param('menteeId') menteeId: string,
  ) {
    return this.preferenceService.getSpecificMenteePreferences(
      userId,
      menteeId,
    );
  }

  @Post('/:userId')
  async setGlobalPreferences(
    @Param('userId') userId: string,
    @Body() body: { preferences: any },
  ) {
    return this.preferenceService.setGlobalPreferences(
      userId,
      body.preferences,
    );
  }
}
