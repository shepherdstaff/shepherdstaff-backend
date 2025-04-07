import { DateTime } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';

export class MeetingRecommendation {
  constructor(props) {
    if (props) Object.assign(this, props);
  }

  startDateTime: DateTime;
  endDateTime: DateTime;
  fromUserId: string;
  toUserId: string;
  status: AppointmentStatus;
}
