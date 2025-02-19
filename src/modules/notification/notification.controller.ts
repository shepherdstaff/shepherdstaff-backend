import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('push')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('subscribe')
  async subscribe(@Body() data: { topic: string; subscription: any }) {
    this.notificationService.saveSubscription(data.topic, data.subscription);
    return { message: `Subscribed to ${data.topic}` };
  }

  @Post('notify')
  async notify(@Body() data: { topic: string, title: string; body: string }) {
    await this.notificationService.sendNotification(data.topic, data.title, data.body);
    return { message: 'Notification sent successfully' };
  }
}