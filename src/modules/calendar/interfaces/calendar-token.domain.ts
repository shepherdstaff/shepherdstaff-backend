export class CalendarToken {
  constructor(props?: Partial<CalendarToken>) {
    if (props) Object.assign(this, props);
  }

  userId: string;
  refreshToken: string;
  accessToken: string;
  expiryDate: Date;
}
