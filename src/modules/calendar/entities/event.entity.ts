import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'event',
})
export class EventEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    startDateTime: Date;

    @Column()
    endDateTime: Date;

    @Column()
    hasTimings: boolean;

    @ManyToOne(
        () => UserEntity, 
        (user) => user.id,           //reverse relation
    )
    @JoinColumn({ name: 'fk_user_id' })
    user: UserEntity;
}