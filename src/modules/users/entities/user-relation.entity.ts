import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEnum } from '../constants/roles';
import { UserEntity } from './user.entity';

@Entity({
  name: 'user_relation',
})
@Index(['fromUser', 'toUser'], { unique: true })
export class UserRelationEntity {
  constructor(props?: Partial<UserRelationEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.outgoingUserRelations)
  @JoinColumn({ name: 'fk_from_user_id' })
  fromUser: UserEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.incomingUserRelations)
  @JoinColumn({ name: 'fk_to_user_id' })
  toUser: UserEntity;

  @Column()
  fromRole: RoleEnum;

  @Column()
  toRole: RoleEnum;
}
