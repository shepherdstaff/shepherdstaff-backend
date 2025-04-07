import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationRepository } from './notification.repository';
import { getMessaging } from 'firebase-admin/messaging';

interface NotificationSubscription {
  endpoints: string;
  expirationTime: number | null;
  keysZ: { p256h: string; auth: string };
}

interface TopicSubscription {
  [topic: string]: NotificationSubscription[];
}

@Injectable()
export class NotificationService {
  private topics: TopicSubscription = {};

  constructor(
    private configService: ConfigService,
    private notificationRepo: NotificationRepository,
  ) {}

  async sendNotification(userId: string, message: string) {
    // Fetch notification tokens from DB
    const notificationClients =
      await this.notificationRepo.getNotificationClients(userId);
    const tokens = notificationClients.map((client) => client.token);

    // Build message payload
    const payload = {
      data: {
        message,
      },
      tokens,
    };

    // Fire notification to user devices using tokens
    getMessaging()
      .sendEachForMulticast(payload)
      .then((response) => {
        console.log('Successfully sent notification message:', response);
      });
  }

  async registerClient(
    userId: string,
    registrationToken: string,
  ): Promise<void> {
    await this.notificationRepo.saveNotificationClient(
      userId,
      registrationToken,
    );
  }
}
