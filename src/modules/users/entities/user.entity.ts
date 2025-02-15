import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  static from(user: User): UserEntity {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.name = user.name;
    userEntity.email = user.email;
    userEntity.birthdate = user.birthdate;

    return userEntity;
  }
}
