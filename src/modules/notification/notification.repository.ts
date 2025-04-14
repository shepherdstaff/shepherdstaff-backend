import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationClientEntity } from './entities/notification-client.entity';
import { Repository } from 'typeorm';
import { NotificationClient } from './domain/notification-client.domain';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationClientEntity)
    private notificationClientRepository: Repository<NotificationClientEntity>,
  ) {}

  async saveNotificationClient(
    userId: string,
    registrationToken: string,
  ): Promise<void> {
    // Check if the client already exists
    const existingClient = await this.notificationClientRepository.findOne({
      where: { token: registrationToken },
    });

    if (existingClient) {
      return;
    }

    await this.notificationClientRepository.save({
      user: { id: userId }, // TODO: validate that user exists
      token: registrationToken,
    });
  }

  async getNotificationClients(userId: string): Promise<NotificationClient[]> {
    const clients = await this.notificationClientRepository.find({
      where: { user: { id: userId } },
    });

    return clients.map((client) => client.toNotificationClient());
  }
}
