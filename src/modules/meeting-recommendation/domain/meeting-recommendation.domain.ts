import { DateTime } from 'luxon';
import { AppointmentStatus } from 'src/interfaces/appointments';

export class MeetingRecommendation {
  constructor(props: Partial<MeetingRecommendation>) {
    if (props) Object.assign(this, props);
  }

  id: string;
  startDateTime: DateTime;
  endDateTime: DateTime;
  fromUserId: string;
  toUserId: string;
  status: AppointmentStatus;
}
