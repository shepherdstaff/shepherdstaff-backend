import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_auth' })
export class UserAuthEntity {
  constructor(props) {
    Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'username', unique: true })
  userName: string;

  @Column()
  hash: string;

  @OneToOne(() => UserEntity, (userEntity) => userEntity.id)
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  refreshToken: string;
}
