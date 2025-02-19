import { Injectable } from '@nestjs/common';
import * as webPush from 'web-push';
import { ConfigService } from '@nestjs/config';

interface NotificationSubscription {
  endpoints: string;
  expirationTime: number |  null;
  keysZ: { p256h: string; auth: string };
}

interface TopicSubscription {
  [topic:string]: NotificationSubscription[];
}

@Injectable()
export class NotificationService {
  private topics: TopicSubscription = {};

  constructor(
    private configService: ConfigService
  ) {
    // Setup your Push client
    webPush.setVapidDetails(
      'exmaple@email.com',
      this.configService.get<string>("VAPID_PUBLIC_KEY"),
      this.configService.get<string>("VAPID_PRIVATE_KEY"),
    );
  }

  saveSubscription(topic: string, subscription: NotificationSubscription) {
    if (!this.topics[topic]) {
      this.topics[topic] = [];
    }
    this.topics[topic].push(subscription);
  }

  async sendNotification(topic: string, title: string, body: string) {
    if (!this.topics[topic]) {
      console.log(`No subscribers for topic: ${topic}`);
      return;
    }
    
    const payload = JSON.stringify({ title, body });

    await Promise.all(
      this.topics[topic].map((sub) =>
        webPush.sendNotification(sub, payload).catch((error) => {
          console.error('Error sending notification:', error);
        }),
      ),
    );
  }
}