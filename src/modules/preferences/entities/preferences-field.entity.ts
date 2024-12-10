import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PreferencesFieldType } from '../enums/preferences-field-types.enum';
import { PreferencesEntity } from './preference.entity';

@Entity({ name: 'preferences_field' })
export class PreferencesFieldEntity {
  constructor(props: Partial<PreferencesFieldEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => PreferencesEntity,
    (preferencesEntity) => preferencesEntity.preferencesFields,
  )
  @JoinColumn({ name: 'fk_preferences_id' })
  preferences: PreferencesEntity;

  @Column()
  name: string;

  @Column()
  type: PreferencesFieldType;

  @Column({ nullable: true })
  valBool: boolean;

  @Column({ nullable: true })
  valEnum: string;
}
