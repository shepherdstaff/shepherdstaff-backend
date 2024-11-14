import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEnum } from '../constants/roles';
import { UserEntity } from './user.entity';

@Entity({
  name: 'user_relation',
})
export class UserRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'fk_from_user_id' })
  fromUserId: UserEntity;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'fk_to_user_id' })
  toUserId: UserEntity;

  @Column()
  fromRole: RoleEnum;

  @Column()
  toRole: RoleEnum;
}
