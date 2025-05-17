import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class NotificationService {
  constructor(private notificationRepo: NotificationRepository) {}

  async sendNotification(userId: string, title: string, message: string) {
    // Fetch notification tokens from DB
    const notificationClients =
      await this.notificationRepo.getNotificationClients(userId);
    const tokens = notificationClients.map((client) => client.token);

    // Build message payload
    const payload = { notification: { title, body: message }, tokens };

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
