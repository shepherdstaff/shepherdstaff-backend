import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationClient } from '../domain/notification-client.domain';

@Entity({
  name: 'notification_client',
})
export class NotificationClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  token: string;

  @Index()
  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  toNotificationClient(): NotificationClient {
    return plainToInstance(NotificationClient, this);
  }
}
