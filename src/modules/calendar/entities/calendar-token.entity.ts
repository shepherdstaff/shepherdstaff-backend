import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CalendarToken } from '../interfaces/calendar-token.domain';

@Entity({
  name: 'calendar_token',
})
export class CalendarTokenEntity {
  constructor(props?: Partial<CalendarTokenEntity>) {
    if (props) Object.assign(this, props);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @Column()
  expiryDate: Date;

  static from(calendarToken: CalendarToken): CalendarTokenEntity {
    return new CalendarTokenEntity({
      userId: calendarToken.userId,
      refreshToken: calendarToken.refreshToken,
      accessToken: calendarToken.accessToken,
      expiryDate: calendarToken.expiryDate,
    });
  }

  toCalendarToken(): CalendarToken {
    return new CalendarToken({
      userId: this.userId,
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expiryDate: this.expiryDate,
    });
  }
}
