import { Controller, Post, Body, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { retrieveUserInfoFromRequest } from 'src/utils/helpers';
import { Request } from 'express';
import { TestNotificationRequestDto } from './dto/test-notification-request.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // TODO: for testing - to be removed in production
  @Post('test-notification')
  @ApiOperation({
    summary: 'Send a test notification',
    description:
      'This endpoint is used to send a test notification to a user. It requires the user ID, title, and message to be provided in the request body.',
  })
  async notify(@Body() body: TestNotificationRequestDto) {
    const { userId, title, message } = body;
    await this.notificationService.sendNotification(userId, title, message);
    return { result: 'Notification sent successfully' };
  }

  @Post('register-client')
  @ApiOperation({
    summary: 'Register a client for notifications',
    description:
      'This endpoint should be called by the frontend to register a client with a registration token to receive notifications.',
  })
  async registerClient(
    @Body() body: { registrationToken: string },
    @Req() req: Request,
  ) {
    const { userId } = retrieveUserInfoFromRequest(req);
    await this.notificationService.registerClient(
      userId,
      body.registrationToken,
    );
  }
}
