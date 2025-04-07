import { UserEntity } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Preferences } from '../domain/preferences';
import { PreferencesFieldEntity } from './preferences-field.entity';

@Entity({ name: 'preferences' })
export class PreferencesEntity {
  constructor(props: Partial<PreferencesEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.id)
  @JoinColumn({ name: 'fk_user_id' })
  user: UserEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.id)
  @JoinColumn({ name: 'fk_preferences_for_user_id' })
  preferencesForUser: UserEntity;

  @OneToMany(
    () => PreferencesFieldEntity,
    (preferencesFieldEntity) => preferencesFieldEntity.preferences,
  )
  preferencesFields: PreferencesFieldEntity[];

  toPreferences(): Preferences {
    return new Preferences({
      fields: this.preferencesFields.reduce((acc, field) => {
        acc[field.name] = field.toDomainValue();
        return acc;
      }, {}),
    });
  }
}
