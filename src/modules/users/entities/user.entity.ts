import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Mentee } from '../domain/mentee';
import { Mentor } from '../domain/mentor';
import { User } from '../domain/user';
import { UserRelationEntity } from './user-relation.entity';

@Entity({
  name: 'user',
})
export class UserEntity {
  constructor(props?: Partial<UserEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  birthdate: Date;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToMany(
    () => UserRelationEntity,
    (userRelationEntity) => userRelationEntity.fromUser,
  )
  outgoingUserRelations: UserRelationEntity[];

  @OneToMany(
    () => UserRelationEntity,
    (userRelationEntity) => userRelationEntity.toUser,
  )
  incomingUserRelations: UserRelationEntity[];

  @Column({ default: false })
  isLimited: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  static from(user: User, isLimited?: boolean): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.name = user.name;
    userEntity.email = user.email;
    userEntity.birthdate = user.birthdate;
    userEntity.isLimited = isLimited;

    return userEntity;
  }

  toMentor(): Mentor {
    return new Mentor({
      id: this.id,
      name: this.name,
      email: this.email,
      birthdate: this.birthdate,
    });
  }

  toMentee(): Mentee {
    return new Mentee({
      id: this.id,
      name: this.name,
      email: this.email,
      birthdate: this.birthdate,
      createdAt: this.createdAt,
    });
  }
}
